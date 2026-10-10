pipeline {
    agent any

    environment {
        IMAGE_NAME = 'rahulpht/sample-api'
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

                        printf '%s' "$DOCKERHUB_TOKEN" |
                            docker login \
                                --username "$DOCKERHUB_USER" \
                                --password-stdin

                        docker push "$IMAGE_NAME:$COMMIT_SHA"

                        docker logout
                    '''
                }
            }
            post {
                always {
                    sh 'docker logout >/dev/null 2>&1 || true'
                }
            }
        }

        stage('Run Container and Verify') {
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
                    CONTAINER="sample-api-ci-$BUILD_NUMBER"

                    docker pull "$IMAGE"
                    docker rm -f "$CONTAINER" 2>/dev/null || true

                    docker run -d \
                        --name "$CONTAINER" \
                        --network jenkins-net \
                        "$IMAGE"

                    READY=0
                    for i in $(seq 1 20); do
                        if curl -fsS \
                           http://"$CONTAINER":3000/health; then
                            READY=1
                            break
                        fi
                        sleep 2
                    done

                    if [ "$READY" -ne 1 ]; then
                        echo "Health check failed"
                        docker logs "$CONTAINER"
                        exit 1
                    fi

                    echo
                    echo "Checking /version"
                    curl -fsS http://"$CONTAINER":3000/version

                    echo
                    echo "Checking /info"
                    curl -fsS http://"$CONTAINER":3000/info
                    echo
                '''
            }
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the first failed stage.'
        }
    }
