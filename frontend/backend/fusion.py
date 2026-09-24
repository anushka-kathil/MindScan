def combine_results(text_score, face_score):
    """
    Apply fusion weights to combine the two model outputs.
    """
    return (text_score * 0.7) + (face_score * 0.3)
