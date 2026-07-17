from django.db import models
from apps.accounts.models import Member


class Savings(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='savings_set')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.CharField(max_length=20)  # e.g., "January 2025"
    date_recorded = models.DateField()
    recorded_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='savings_recorded'
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_recorded']
        verbose_name_plural = 'Savings'

    def __str__(self):
        return f'{self.member.member_id} - {self.month} - {self.amount}'
