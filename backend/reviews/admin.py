from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'target_id', 'rating', 'likes', 'created_at')
    list_filter = ('category', 'rating', 'created_at')
    search_fields = ('user__username', 'comment')

