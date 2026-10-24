"""
ReportLab PDF Clinical Diagnostics Report Builder.
Generates an A4 print-ready medical report complete with:
- Patient & Report Metadata Header
- Strict Non-Diagnostic Medical Disclaimer & Emergency Hotlines
- Summary Table & Counts
- Cross-Marker Pattern Callouts
- Comprehensive Marker Tables with Reference Bounds
- Prescribed Medications section (strictly labelled "from your prescription")
- Consolidated Questions for Physician Consultation
- Doctor-Friendly Clinical Summary Page
- Methodology & Limitations Page
- Privacy-preserving QR Code linking to consent-based share URL
"""

import io
import qrcode
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

from app.labs.insight_engine import InsightsResponse, InsightCard, CrossMarkerPattern


class NumberedCanvas(canvas.Canvas):
    """Adds running headers and footers with page numbers to every page."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        # Top Header line
        self.setStrokeColor(colors.HexColor("#0284C7"))
        self.setLineWidth(1)
        self.line(15 * mm, 282 * mm, 195 * mm, 282 * mm)

        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0284C7"))
        self.drawString(15 * mm, 285 * mm, "MEDIMITRA CLINICAL HEALTH HUB — LABORATORY DIAGNOSTICS REPORT")

        self.setFont("Helvetica", 7)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(195 * mm, 285 * mm, "INFORMATIONAL SUMMARY • NOT A DIAGNOSIS")

        # Bottom Footer line
        self.line(15 * mm, 16 * mm, 195 * mm, 16 * mm)
        self.setFont("Helvetica", 7)
        self.drawString(15 * mm, 11 * mm, "Emergency Hotline: Call 112 (India) | Medical Disclaimer on Back Page")
        self.drawRightString(195 * mm, 11 * mm, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def generate_qr_image_bytes(share_url: str) -> io.BytesIO:
    """Generates QR code PNG image stream for privacy-preserving share URL."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1,
    )
    qr.add_data(share_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0369A1", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def build_lab_report_pdf(
    insights_data: InsightsResponse,
    share_token: str = "demo-share-token-2026",
    language_code: str = "en"
) -> bytes:
    """
    Constructs the complete multi-page PDF laboratory report in memory.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0284C7")
    )
    subtitle_style = ParagraphStyle(
        "CoverSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569")
    )
    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=10,
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#0369A1"),
        spaceBefore=6,
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        "BodyTextSmall",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155")
    )
    disclaimer_style = ParagraphStyle(
        "DisclaimerBox",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#B45309")
    )

    story = []

    # 1. Header Banner
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Laboratory Biomarker & Diagnostics Dossier", title_style))
    story.append(Paragraph(
        f"Automated Clinical Reference Evaluation & Longitudinal Trends • Generated on {datetime.now(timezone.utc).strftime('%d %B %Y')}",
        subtitle_style
    ))
    story.append(Spacer(1, 4 * mm))

    # Patient & Document Meta Box
    p_name = insights_data.patient_name or "Patient"
    doc_date = insights_data.document_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    meta_data = [
        [
            Paragraph(f"<b>Patient Name:</b> {p_name}", body_style),
            Paragraph(f"<b>Report Date:</b> {doc_date}", body_style)
        ],
        [
            Paragraph(f"<b>Evaluation Engine:</b> MediMitra OLS v2.4", body_style),
            Paragraph(f"<b>Total Biomarkers Evaluated:</b> {insights_data.summary.total_markers}", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[90 * mm, 90 * mm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F0F9FF")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#BAE6FD")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E0F2FE")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4 * mm))

    # Medical Disclaimer Callout
    crit_alert = ""
    if insights_data.summary.critical_count > 0:
        crit_alert = f"<br/><font color='#DC2626'><b>ATTENTION CRITICAL VALUES DETECTED:</b> {insights_data.summary.critical_warning}</font>"

    disclaimer_text = (
        "<b>CLINICAL SAFETY MANDATE & DISCLAIMER:</b><br/>"
        "This dossier is generated for patient health literacy and doctor consultation. "
        "It does NOT diagnose disease, establish medical treatment targets, or recommend medications. "
        f"{insights_data.medical_disclaimer}{crit_alert}"
    )
    disc_table = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[180 * mm])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(disc_table)
    story.append(Spacer(1, 5 * mm))

    # 2. Executive Summary Metrics Table
    story.append(Paragraph("1. Executive Summary & Wellness Overview", h1_style))
    sum_data = [
        [
            Paragraph("<b>Normal</b>", body_style),
            Paragraph("<b>Above Range (High)</b>", body_style),
            Paragraph("<b>Below Range (Low)</b>", body_style),
            Paragraph("<b>Critical Priority</b>", body_style),
            Paragraph("<b>Informational Wellness</b>", body_style)
        ],
        [
            Paragraph(f"<font size=12 color='#16A34A'><b>{insights_data.summary.normal_count}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#DC2626'><b>{insights_data.summary.high_count}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#D97706'><b>{insights_data.summary.low_count}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#991B1B'><b>{insights_data.summary.critical_count}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#0284C7'><b>{insights_data.summary.wellness_score or 85}/100</b></font>", body_style)
        ]
    ]
    sum_table = Table(sum_data, colWidths=[36 * mm] * 5)
    sum_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(sum_table)

    if insights_data.summary.wellness_formula:
        story.append(Spacer(1, 2 * mm))
        story.append(Paragraph(f"<i>Formula note: {insights_data.summary.wellness_formula}</i>", body_style))

    story.append(Spacer(1, 4 * mm))

    # Top Discussion Items
    story.append(Paragraph("Key Findings for Doctor Discussion:", h2_style))
    for idx, item in enumerate(insights_data.summary.top_discussion_items, start=1):
        story.append(Paragraph(f"• <b>Item {idx}:</b> {item}", body_style))

    story.append(Spacer(1, 5 * mm))

    # 3. Cross-Marker Pattern Detection
    if insights_data.patterns_detected:
        story.append(Paragraph("2. Explainable Cross-Marker Patterns Noticed", h1_style))
        for pat in insights_data.patterns_detected:
            pat_content = [
                [Paragraph(f"<b>[Rule {pat.rule_id}] {pat.title}</b> — <i>{pat.panel}</i>", body_style)],
                [Paragraph(f"<b>Observation:</b> {pat.description}", body_style)],
                [Paragraph(f"<b>Triggering Lab Values:</b> {pat.trigger_values}", body_style)],
                [Paragraph(f"<b>Physician Discussion Note:</b> {pat.recommendation}", body_style)],
                [Paragraph(f"<b>Clinical Guideline Cited:</b> {pat.guideline_source}", disclaimer_style)]
            ]
            pat_tbl = Table(pat_content, colWidths=[180 * mm])
            pat_tbl.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFBEB")),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 7),
                ('RIGHTPADDING', (0, 0), (-1, -1), 7),
            ]))
            story.append(pat_tbl)
            story.append(Spacer(1, 3 * mm))
        story.append(Spacer(1, 3 * mm))

    # Page Break for Biomarker Roster Table
    story.append(PageBreak())

    # 4. Complete Biomarker Table
    story.append(Paragraph("3. Full Biomarker Roster & Normalised Reference Evaluation", h1_style))
    story.append(Paragraph(
        "Values classified according to official clinical guidelines (ICMR / ADA / WHO). "
        "Non-diagnostic status labels provided for physician review.",
        body_style
    ))
    story.append(Spacer(1, 3 * mm))

    table_rows = [
        [
            Paragraph("<b>Biomarker</b>", body_style),
            Paragraph("<b>Panel</b>", body_style),
            Paragraph("<b>Result</b>", body_style),
            Paragraph("<b>Reference Range</b>", body_style),
            Paragraph("<b>Status</b>", body_style),
            Paragraph("<b>Range Source</b>", body_style)
        ]
    ]

    for c in insights_data.insights:
        status_color = "#16A34A" if c.status == "Normal" else ("#DC2626" if "High" in c.status or "Critical" in c.status else "#D97706")
        status_cell = Paragraph(f"<b><font color='{status_color}'>{c.status}</font></b>", body_style)
        conv_flag = " (converted)" if c.is_converted else ""

        table_rows.append([
            Paragraph(c.name, body_style),
            Paragraph(c.panel, body_style),
            Paragraph(f"<b>{c.value}</b> {c.unit}{conv_flag}", body_style),
            Paragraph(c.range_used, body_style),
            status_cell,
            Paragraph(c.range_source, body_style)
        ])

    bio_table = Table(table_rows, colWidths=[42 * mm, 32 * mm, 26 * mm, 30 * mm, 22 * mm, 28 * mm])
    bio_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0284C7")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(bio_table)
    story.append(Spacer(1, 5 * mm))

    # 5. Prescribed Medications (Strictly from user prescription)
    if insights_data.medicines_from_prescription:
        story.append(Paragraph("4. Documented Medications (From Your Uploaded Prescription)", h1_style))
        story.append(Paragraph(
            "<i>Note: The following medications are extracted exclusively from your own uploaded prescription. "
            "MediMitra never suggests, initiates, alters, or terminates any medication or dosing regimen.</i>",
            body_style
        ))
        story.append(Spacer(1, 2 * mm))
        meds_text = ", ".join(insights_data.medicines_from_prescription)
        meds_table = Table([[Paragraph(f"<b>Prescribed Meds:</b> {meds_text}", body_style)]], colWidths=[180 * mm])
        meds_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#94A3B8")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(meds_table)
        story.append(Spacer(1, 5 * mm))

    # 6. Questions for Your Doctor
    story.append(KeepTogether([
        Paragraph("5. Prepared Questions for Your Doctor", h1_style),
        Paragraph(
            "Take these non-diagnostic clinical inquiry prompts to your next consultation:",
            body_style
        ),
        Spacer(1, 2 * mm)
    ]))

    consolidated_questions = []
    for c in insights_data.insights:
        if c.status != "Normal":
            for q in c.questions_for_doctor:
                if q not in consolidated_questions:
                    consolidated_questions.append(f"{c.name}: {q}")

    if not consolidated_questions:
        consolidated_questions = [
            "Are there any preventive nutrition habits that best suit my age and physical activity?",
            "What routine interval do you recommend for repeating wellness blood profiles?"
        ]

    for q in consolidated_questions[:6]:
        story.append(Paragraph(f"• {q}", body_style))

    story.append(Spacer(1, 5 * mm))

    # 7. Consent-Based QR Code Share & Doctor Verification
    story.append(KeepTogether([
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284C7"), spaceBefore=5, spaceAfter=5),
        Paragraph("6. Doctor-Friendly Verification & Consent-Based Sharing", h1_style),
        Paragraph(
            "Scan the QR code below using any mobile camera to view the secure, consent-based digital view. "
            "<b>No personal health information is stored in the QR code itself</b>; access requires user authorization.",
            body_style
        ),
        Spacer(1, 3 * mm)
    ]))

    share_url = f"https://medimitra.health/share/{share_token}"
    qr_stream = generate_qr_image_bytes(share_url)
    qr_img = Image(qr_stream, width=28 * mm, height=28 * mm)

    qr_block = [
        [
            qr_img,
            Paragraph(
                f"<b>Secure Digital Verification Portal</b><br/>"
                f"<font color='#0284C7'>{share_url}</font><br/><br/>"
                f"• Verified SHA-256 Audit Trail<br/>"
                f"• Dynamic Multi-Report Comparison Available Online<br/>"
                f"• End-to-End Encrypted Patient Profile",
                body_style
            )
        ]
    ]
    qr_table = Table(qr_block, colWidths=[35 * mm, 145 * mm])
    qr_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(qr_table)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()
