from django.db import models
from apps.accounts.models import Member


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('savings_credit', 'Savings Credit'),
        ('loan_debit', 'Loan Disbursement'),
        ('loan_repayment', 'Loan Repayment'),
        ('share_purchase', 'Share Purchase'),
        ('other', 'Other'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    reference = models.CharField(max_length=50, blank=True)
    date = models.DateField()
    recorded_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='transactions_recorded'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.member.member_id} - {self.transaction_type} - {self.amount}'
