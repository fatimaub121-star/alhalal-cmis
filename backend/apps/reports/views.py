from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from io import BytesIO
from datetime import date
from apps.accounts.models import Member
from apps.accounts.views import IsAdminUser


def build_pdf_response(buffer, filename):
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


class MemberStatementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, member_id):
        # Members can only view their own, admins can view any
        if request.user.role != 'admin':
            try:
                own_member = Member.objects.get(user=request.user)
                if str(own_member.id) != str(member_id):
                    return HttpResponse(status=403)
            except Member.DoesNotExist:
                return HttpResponse(status=403)

        try:
            member = Member.objects.select_related('user').get(id=member_id)
        except Member.DoesNotExist:
            return HttpResponse(status=404)

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()

        GREEN = colors.HexColor('#2E7D32')
        LIGHT_GREEN = colors.HexColor('#E8F5E9')

        title_style = ParagraphStyle('Title', parent=styles['Heading1'],
                                     textColor=GREEN, fontSize=18, spaceAfter=4)
        subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
                                        textColor=colors.HexColor('#5A7A5A'), fontSize=10, spaceAfter=12)
        heading_style = ParagraphStyle('Heading', parent=styles['Heading2'],
                                       textColor=GREEN, fontSize=13, spaceBefore=12, spaceAfter=6)

        elements = []

        # Header
        elements.append(Paragraph('Al-Halal Cooperative Multipurpose Society', title_style))
        elements.append(Paragraph('Federal University of Technology, Minna, Niger State', subtitle_style))
        elements.append(Spacer(1, 0.3*cm))

        # Member info
        elements.append(Paragraph('Member Account Statement', heading_style))
        info_data = [
            ['Member ID:', member.member_id, 'Name:', member.user.full_name],
            ['Email:', member.user.email, 'Phone:', member.phone],
            ['Department:', member.department, 'Date Joined:', str(member.date_joined_cooperative)],
            ['Status:', member.status.capitalize(), 'Statement Date:', str(date.today())],
        ]
        info_table = Table(info_data, colWidths=[3.5*cm, 5.5*cm, 3*cm, 5.5*cm])
        info_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), GREEN),
            ('TEXTCOLOR', (2, 0), (2, -1), GREEN),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, LIGHT_GREEN]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E8E0')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 0.5*cm))

        # Savings Summary
        elements.append(Paragraph('Savings History', heading_style))
        savings_qs = member.savings_set.all().order_by('-date_recorded')
        if savings_qs.exists():
            savings_data = [['Month', 'Amount (NGN)', 'Date Recorded', 'Notes']]
            for s in savings_qs:
                savings_data.append([s.month, f'{s.amount:,.2f}', str(s.date_recorded), s.notes or '-'])
            savings_data.append(['TOTAL', f'{member.total_savings():,.2f}', '', ''])
            s_table = Table(savings_data, colWidths=[4*cm, 4*cm, 4*cm, 5.5*cm])
            s_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), GREEN),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('BACKGROUND', (0, -1), (-1, -1), LIGHT_GREEN),
                ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, LIGHT_GREEN]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E8E0')),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(s_table)
        else:
            elements.append(Paragraph('No savings records found.', styles['Normal']))

        elements.append(Spacer(1, 0.5*cm))

        # Loans Summary
        elements.append(Paragraph('Loan History', heading_style))
        loans_qs = member.loans.all().order_by('-applied_on')
        if loans_qs.exists():
            loan_data = [['Loan No.', 'Amount (NGN)', 'Status', 'Applied On', 'Balance']]
            for ln in loans_qs:
                loan_data.append([
                    ln.loan_number,
                    f'{ln.amount_approved or ln.amount_requested:,.2f}',
                    ln.status.capitalize(),
                    str(ln.applied_on),
                    f'{ln.balance_outstanding:,.2f}',
                ])
            ln_table = Table(loan_data, colWidths=[3*cm, 4*cm, 3*cm, 3.5*cm, 4*cm])
            ln_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), GREEN),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GREEN]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E8E0')),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(ln_table)
        else:
            elements.append(Paragraph('No loan records found.', styles['Normal']))

        elements.append(Spacer(1, 0.5*cm))

        # Footer
        elements.append(Paragraph(
            f'This statement was generated on {date.today()} by the Al-Halal CMIS. '
            'For enquiries, contact the cooperative office.',
            ParagraphStyle('footer', parent=styles['Normal'], fontSize=8,
                           textColor=colors.HexColor('#5A7A5A'))
        ))

        doc.build(elements)
        return build_pdf_response(buffer, f'statement_{member.member_id}_{date.today()}.pdf')


class AnnualReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        year = request.query_params.get('year', date.today().year)
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        GREEN = colors.HexColor('#2E7D32')
        LIGHT_GREEN = colors.HexColor('#E8F5E9')
        heading_style = ParagraphStyle('H', parent=styles['Heading2'], textColor=GREEN,
                                       fontSize=13, spaceBefore=12, spaceAfter=6)
        elements = []
        elements.append(Paragraph('Al-Halal Cooperative Multipurpose Society', ParagraphStyle(
            'T', parent=styles['Heading1'], textColor=GREEN, fontSize=18, spaceAfter=4)))
        elements.append(Paragraph(f'Annual Financial Report — {year}', ParagraphStyle(
            'S', parent=styles['Normal'], textColor=colors.HexColor('#5A7A5A'), fontSize=11, spaceAfter=12)))

        from apps.savings.models import Savings
        from apps.loans.models import Loan
        from django.db.models import Sum, Count

        total_members = Member.objects.filter(status='active').count()
        total_savings = Savings.objects.filter(
            date_recorded__year=year).aggregate(t=Sum('amount'))['t'] or 0
        total_loans = Loan.objects.filter(
            applied_on__year=year).aggregate(t=Sum('amount_approved'))['t'] or 0
        total_repaid = Loan.objects.filter(
            applied_on__year=year).aggregate(t=Sum('total_repaid'))['t'] or 0

        summary_data = [
            ['Metric', 'Value'],
            ['Active Members', str(total_members)],
            ['Total Savings Collected', f'NGN {total_savings:,.2f}'],
            ['Total Loans Disbursed', f'NGN {total_loans:,.2f}'],
            ['Total Loan Repayments', f'NGN {total_repaid:,.2f}'],
            ['Outstanding Loans', f'NGN {float(total_loans) - float(total_repaid):,.2f}'],
        ]
        t = Table(summary_data, colWidths=[9*cm, 8*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), GREEN),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_GREEN]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E8E0')),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(Paragraph('Financial Summary', heading_style))
        elements.append(t)
        elements.append(Spacer(1, 0.5*cm))
        elements.append(Paragraph(
            f'Report generated on {date.today()}.',
            ParagraphStyle('f', parent=styles['Normal'], fontSize=8,
                           textColor=colors.HexColor('#5A7A5A'))
        ))
        doc.build(elements)
        return build_pdf_response(buffer, f'annual_report_{year}.pdf')
