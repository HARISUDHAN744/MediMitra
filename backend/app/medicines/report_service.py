"""
Medicine Report Generation Service
Generates official, downloadable PDF summary of medicine rates, generic alternatives,
drug interaction disclosures, and savings calculations.
Strictly adheres to safety rules: no treatment advice, includes full medical disclaimer.
"""

import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from app.medicines.schemas import MedicineDetail, SubstituteResponse


def generate_medicine_pdf(
    detail: MedicineDetail,
    substitutes: SubstituteResponse,
) -> bytes:
    """
    Generate an official ReportLab PDF summary for a medicine,
    showing price, price as of date, source, generic substitutes, and safety notices.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )
    notice_style = ParagraphStyle(
        "NoticeStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0369a1"),
    )
    disclaimer_style = ParagraphStyle(
        "DisclaimerStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#991b1b"),
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("AUSHADHI KNOWLEDGE BASE", title_style))
    elements.append(
        Paragraph(
            f"Official Medicine Pricing & Generic Equivalence Brief &bull; Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            subtitle_style,
        )
    )
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=12))

    # Medicine Overview Table
    med_info_data = [
        [
            Paragraph("<b>Brand Name:</b>", body_style),
            Paragraph(detail.brand_name, body_style),
            Paragraph("<b>Dosage Form:</b>", body_style),
            Paragraph(detail.dosage_form, body_style),
        ],
        [
            Paragraph("<b>Strength:</b>", body_style),
            Paragraph(detail.strength_text, body_style),
            Paragraph("<b>Regulation:</b>", body_style),
            Paragraph("Schedule H (Rx)" if detail.schedule_h_flag else detail.rx_or_otc, body_style),
        ],
        [
            Paragraph("<b>Pack Size:</b>", body_style),
            Paragraph(f"{detail.pack_size} {detail.pack_unit}", body_style),
            Paragraph("<b>Manufacturer:</b>", body_style),
            Paragraph(detail.manufacturer or "N/A", body_style),
        ],
        [
            Paragraph("<b>MRP:</b>", body_style),
            Paragraph(f"₹{detail.mrp:.2f} (₹{detail.price_per_unit:.2f}/unit)", body_style),
            Paragraph("<b>Price As Of:</b>", body_style),
            Paragraph(f"{detail.price_as_of} ({detail.source_name})", body_style),
        ],
    ]
    t_info = Table(med_info_data, colWidths=[1.3 * inch, 2.2 * inch, 1.3 * inch, 2.2 * inch])
    t_info.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    elements.append(t_info)
    elements.append(Spacer(1, 10))

    # Active Ingredients
    elements.append(Paragraph("Active Ingredient Composition", section_heading))
    ing_rows = [[Paragraph("<b>Ingredient</b>", body_style), Paragraph("<b>Strength</b>", body_style), Paragraph("<b>RxNorm ID</b>", body_style)]]
    for ing in detail.ingredients:
        ing_rows.append(
            [
                Paragraph(ing.name, body_style),
                Paragraph(f"{ing.strength_value} {ing.strength_unit}", body_style),
                Paragraph(ing.rxnorm_id or "Standardized", body_style),
            ]
        )
    t_ing = Table(ing_rows, colWidths=[3.5 * inch, 1.8 * inch, 1.7 * inch])
    t_ing.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    elements.append(t_ing)
    elements.append(Spacer(1, 10))

    # Generic & Brand Substitutes Table
    elements.append(Paragraph("Equivalent Substitutes & Generic Alternatives", section_heading))
    elements.append(
        Paragraph(
            "<b>Generic Substitution Notice:</b> Same ingredient and strength. Ask your doctor or pharmacist before switching.",
            notice_style,
        )
    )
    elements.append(Spacer(1, 4))

    sub_rows = [
        [
            Paragraph("<b>Alternative / Brand</b>", body_style),
            Paragraph("<b>Manufacturer</b>", body_style),
            Paragraph("<b>Price / Pack</b>", body_style),
            Paragraph("<b>Savings (₹)</b>", body_style),
            Paragraph("<b>Savings (%)</b>", body_style),
            Paragraph("<b>Source & Date</b>", body_style),
        ]
    ]

    if substitutes.jan_aushadhi_option:
        ja = substitutes.jan_aushadhi_option
        sub_rows.append(
            [
                Paragraph(f"<b>{ja.brand_name}</b> (PMBJP Generic)", body_style),
                Paragraph(ja.manufacturer or "PMBJP", body_style),
                Paragraph(f"₹{ja.mrp:.2f}", body_style),
                Paragraph(f"₹{ja.savings_rupees:.2f}", body_style),
                Paragraph(f"<b>{ja.savings_percentage:.1f}%</b>", body_style),
                Paragraph(f"{ja.source} as of {ja.price_as_of}", body_style),
            ]
        )

    for sub in substitutes.substitutes[:6]:
        sub_rows.append(
            [
                Paragraph(sub.brand_name, body_style),
                Paragraph(sub.manufacturer or "Pharma", body_style),
                Paragraph(f"₹{sub.mrp:.2f}", body_style),
                Paragraph(f"₹{sub.savings_rupees:.2f}", body_style),
                Paragraph(f"{sub.savings_percentage:.1f}%", body_style),
                Paragraph(f"{sub.source} as of {sub.price_as_of}", body_style),
            ]
        )

    t_sub = Table(sub_rows, colWidths=[1.8 * inch, 1.4 * inch, 0.9 * inch, 0.8 * inch, 0.8 * inch, 1.3 * inch])
    t_sub.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    elements.append(t_sub)
    elements.append(Spacer(1, 10))

    # Quoted FDA / Open Label Disclosures
    if detail.label_sections:
        elements.append(Paragraph("Official Label Disclosures (openFDA / US FDA Label)", section_heading))
        elements.append(
            Paragraph("<i>Notice: US label disclosures, may differ for Indian indications.</i>", notice_style)
        )
        elements.append(Spacer(1, 3))
        for sec_name, sec_text in list(detail.label_sections.items())[:3]:
            elements.append(Paragraph(f"<b>{sec_name.replace('_', ' ').title()}:</b>", body_style))
            elements.append(Paragraph(f'"{sec_text}"', body_style))
            elements.append(Spacer(1, 4))

    # Medical Disclaimer (Mandatory)
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#f87171"), spaceAfter=6))
    elements.append(
        Paragraph(
            "<b>MANDATORY MEDICAL DISCLAIMER:</b> This document is provided solely for educational and informational purposes. "
            "It does NOT contain medical advice, diagnosis, treatment recommendations, or dosing instructions. "
            "Never start, stop, or change medication without consulting a qualified medical practitioner. "
            "In case of a medical emergency, call 112 or visit the nearest hospital emergency department immediately.",
            disclaimer_style,
        )
    )

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
