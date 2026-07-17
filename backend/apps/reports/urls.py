from django.urls import path
from .views import MemberStatementView, AnnualReportView

urlpatterns = [
    path('statement/<int:member_id>/', MemberStatementView.as_view(), name='member-statement'),
    path('annual/', AnnualReportView.as_view(), name='annual-report'),
]
