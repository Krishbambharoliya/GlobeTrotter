from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trip, TripStop, TripActivity

class TripActivitySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = TripActivity
        fields = ['id', 'name', 'description', 'category', 'cost', 'duration_hours', 'start_time', 'order']

class TripStopSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    activities = TripActivitySerializer(many=True, required=False)

    class Meta:
        model = TripStop
        fields = ['id', 'city_name', 'country_name', 'cost_index', 'popularity', 'date', 'order', 'activities']

class TripSerializer(serializers.ModelSerializer):
    stops = TripStopSerializer(many=True, required=False)
    user_username = serializers.CharField(source='user.username', read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ['id', 'user', 'user_username', 'name', 'description', 'start_date', 'end_date', 'cover_photo', 'is_public', 'budget_limit', 'total_cost', 'stops', 'created_at', 'updated_at']
        read_only_fields = ['user']

    def get_total_cost(self, obj):
        total = 0
        for stop in obj.stops.all():
            for activity in stop.activities.all():
                total += activity.cost
        return total

    def create(self, validated_data):
        stops_data = validated_data.pop('stops', [])
        trip = Trip.objects.create(**validated_data)
        
        for stop_order, stop_data in enumerate(stops_data):
            activities_data = stop_data.pop('activities', [])
            order = stop_data.pop('order', stop_order)
            stop_data.pop('id', None)
            stop = TripStop.objects.create(trip=trip, order=order, **stop_data)
            
            for act_order, act_data in enumerate(activities_data):
                act_order_val = act_data.pop('order', act_order)
                act_data.pop('id', None)
                TripActivity.objects.create(stop=stop, order=act_order_val, **act_data)
                
        return trip

    def update(self, instance, validated_data):
        stops_data = validated_data.pop('stops', None)
        
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.cover_photo = validated_data.get('cover_photo', instance.cover_photo)
        instance.is_public = validated_data.get('is_public', instance.is_public)
        instance.budget_limit = validated_data.get('budget_limit', instance.budget_limit)
        instance.save()
        
        if stops_data is not None:
            # Simple approach: clear and rebuild nested stops & activities to support reordering & deletions easily
            instance.stops.all().delete()
            for stop_order, stop_data in enumerate(stops_data):
                activities_data = stop_data.pop('activities', [])
                order = stop_data.pop('order', stop_order)
                stop_data.pop('id', None)
                stop = TripStop.objects.create(trip=instance, order=order, **stop_data)
                
                for act_order, act_data in enumerate(activities_data):
                    act_order_val = act_data.pop('order', act_order)
                    act_data.pop('id', None)
                    TripActivity.objects.create(stop=stop, order=act_order_val, **act_data)
                    
        return instance
