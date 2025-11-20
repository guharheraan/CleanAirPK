def calculate_risk_score(age, has_chronic_conditions, is_smoker, daily_outdoor_hours):
    """
    Calculate personalized risk score based on user factors
    """
    score = 0
    
    # Age factor
    if age >= 65:
        score += 3
    elif age >= 50:
        score += 2
    elif age >= 30:
        score += 1
    
    # Health conditions
    if has_chronic_conditions:
        score += 3
    
    # Smoking
    if is_smoker:
        score += 2
    
    # Outdoor exposure
    if daily_outdoor_hours >= 8:
        score += 3
    elif daily_outdoor_hours >= 4:
        score += 2
    elif daily_outdoor_hours >= 2:
        score += 1
    
    # Determine category and advice
    if score >= 8:
        category = "High Risk"
        advice = "Limit outdoor activities, use N95 masks, monitor AQI regularly, consider air purifiers"
    elif score >= 5:
        category = "Moderate Risk" 
        advice = "Reduce prolonged outdoor exposure, check AQI before activities, consider masks on bad air days"
    elif score >= 3:
        category = "Low Risk"
        advice = "Generally safe but monitor air quality during high pollution periods"
    else:
        category = "Very Low Risk"
        advice = "Minimal risk but maintain awareness of air quality conditions"
    
    return {
        "score": score,
        "category": category,
        "advice": advice
    }