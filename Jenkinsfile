pipeline {
    agent any

    environment {
        VPS_USER = "root"
        VPS_HOST = "93.127.195.155"
        VPS_BACKEND_DIR = "/root/wild-valley-foods-backend-api"
        GIT_REPO = "https://github.com/siffrum/wild-valley-foods-backend-api.git/"
    }

    stages {

        stage('Clone Latest Backend Code') {
            steps {
                sh """
                    echo "Cleaning old workspace..."
                    rm -rf backend-src

                    echo "Cloning backend repository..."
                    git clone ${GIT_REPO} backend-src
                """
            }
        }

        stage('Upload Code to VPS') {
            steps {
                sh """
                    echo "Copying updated code to VPS without overwriting .env..."
                    rsync -avz --delete \
                        --exclude='.env' \
                        backend-src/ ${VPS_USER}@${VPS_HOST}:${VPS_BACKEND_DIR}/
                """
            }
        }


        stage('Install Dependencies') {
            steps {
                sh """
                    echo "Running npm install on VPS..."
                    ssh ${VPS_USER}@${VPS_HOST} "
                        cd ${VPS_BACKEND_DIR} &&
                        npm install
                    "
                """
            }
        }

        stage('Restart PM2 Services') {
            steps {
                sh """
                    echo "Restarting backend with PM2..."
                    ssh ${VPS_USER}@${VPS_HOST} "
                        pm2 restart all
                    "
                """
            }
        }
    }
}
