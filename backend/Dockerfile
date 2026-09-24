# Use Python 3.11
FROM python:3.11-slim

# Install system dependencies for image processing
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Hugging Face Spaces use port 7860 by default
EXPOSE 7860

# Run with Gunicorn, binding to 0.0.0.0:7860
CMD ["gunicorn", "inference:app", "--timeout", "120", "--workers", "1", "--bind", "0.0.0.0:7860"]
