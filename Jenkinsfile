pipeline {
    agent any

    environment {
        IMAGE_NAME = 'rahulpht/sample-api'
        APP_CONTAINER = 'sample-api'
        APP_PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.COMMIT_SHA = sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()
                }

                echo 'Source code checked out successfully.'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -eu
                    docker build -t "$IMAGE_NAME:$COMMIT_SHA" .
                '''
            }
        }

        stage('Publish to Docker Hub') {
            when {
                expression {
                    env.BRANCH_NAME == 'main' ||
                    env.GIT_BRANCH == 'origin/main'
                }
            }

            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        export DOCKER_CONFIG="$(mktemp -d)"

                        cleanup() {
                            docker logout >/dev/null 2>&1 || true
                            rm -rf "$DOCKER_CONFIG"
                        }
                        trap cleanup EXIT

                        printf '%s' "$DOCKERHUB_TOKEN" |
                            docker login \
                                --username "$DOCKERHUB_USER" \
                                --password-stdin

                        docker push "$IMAGE_NAME:$COMMIT_SHA"
                    '''
                }
            }
        }

        stage('Deploy and Verify') {
            when {
                expression {
                    env.BRANCH_NAME == 'main' ||
                    env.GIT_BRANCH == 'origin/main'
                }
            }

            steps {
                sh '''
                    set -eu

                    IMAGE="$IMAGE_NAME:$COMMIT_SHA"

                    echo "Pulling image: $IMAGE"
                    docker pull "$IMAGE"

                    # Remove the previous app container, if present.
                    docker rm -f "$APP_CONTAINER" 2>/dev/null || true

                    # Start the new application container.
                    # Keep it running after the pipeline finishes.
                    docker run -d \
                        --name "$APP_CONTAINER" \
                        --restart unless-stopped \
                        --network jenkins-net \
                        -p "$APP_PORT:$APP_PORT" \
                        "$IMAGE"

                    # Wait for the application to become healthy.
                    READY=0

                    for i in $(seq 1 30); do
                        if curl -fsS \
                            "http://$APP_CONTAINER:$APP_PORT/health"; then
                            READY=1
                            break
                        fi

                        sleep 2
                    done

                    if [ "$READY" -ne 1 ]; then
                        echo "Health check failed."
                        docker logs "$APP_CONTAINER"
                        exit 1
                    fi

                    echo
                    echo "Checking /version"
                    curl -fsS \
                        "http://$APP_CONTAINER:$APP_PORT/version"

                    echo
                    echo "Checking /info"
                    curl -fsS \
                        "http://$APP_CONTAINER:$APP_PORT/info"

                    echo
                    echo "Deployment and endpoint checks passed."
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. The deployed app container is not removed.'
            sh 'docker image prune -f || true'
        }

        success {
            echo 'CI/CD pipeline completed successfully.'
            echo 'Application URL: http://localhost:3000'
        }

        failure {
            echo 'Pipeline failed. Check the first failed stage.'
        }
    }
}
