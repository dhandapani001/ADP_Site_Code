FROM python:3.12-slim

WORKDIR /app

# Prevent Python from writing .pyc and buffer logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose server port
EXPOSE 5000

# Run with Gunicorn production server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
