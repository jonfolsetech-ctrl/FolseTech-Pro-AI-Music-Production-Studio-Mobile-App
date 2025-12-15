terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

# Cloud Run for API
resource "google_cloud_run_service" "api" {
  name     = "folsetech-ai-api"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/folsetech-ai-api:latest"
        
        env {
          name  = "REDIS_URL"
          value = "redis://${google_redis_instance.cache.host}:${google_redis_instance.cache.port}"
        }
        
        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Cloud Run for AI Service (with GPU)
resource "google_cloud_run_service" "ai_service" {
  name     = "folsetech-ai-service"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/folsetech-ai-service:latest"
        
        resources {
          limits = {
            cpu    = "4"
            memory = "8Gi"
            "nvidia.com/gpu" = "1"
          }
        }
      }
    }

    metadata {
      annotations = {
        "run.googleapis.com/execution-environment" = "gen2"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Redis instance
resource "google_redis_instance" "cache" {
  name           = "folsetech-cache"
  tier           = "STANDARD_HA"
  memory_size_gb = 1
  region         = var.region
}

# Firebase Hosting (manual setup required)
# Use firebase deploy command

# Cloud Storage bucket for uploads
resource "google_storage_bucket" "uploads" {
  name     = "${var.project_id}-uploads"
  location = var.region
}

# IAM for Cloud Run
resource "google_cloud_run_service_iam_member" "api_public" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "api_url" {
  value = google_cloud_run_service.api.status[0].url
}

output "ai_service_url" {
  value = google_cloud_run_service.ai_service.status[0].url
}
