pipeline {
    agent any

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        PROJECT = "poc-app"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/kartikrai2206/poc-app.git'
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                docker build -t $PROJECT/backend:$IMAGE_TAG ./backend
                docker build -t $PROJECT/frontend:$IMAGE_TAG ./frontend
                
                '''
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh '''
                echo "Stopping Old containers"
                docker compose down || true
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                echo "Deploying containers"
                docker compose up -d --build
                echo "Containers Deployed. Moving to Health check"
                '''
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sh '''
                    echo "Waiting for services..."
                    sleep 15

                    curl -f http://localhost || exit 1
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful"
        }
        failure {
            echo "❌ Pipeline failed"
        }
        always {
            echo "Pipeline finished"
        }
    }
}