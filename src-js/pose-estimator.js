import * as posenet from '@tensorflow-models/posenet';


class PoseEstimator {
    constructor() {
        this.imageScaleFactor = 0.5;
        this.outputStride = 16;
        this.flipHorizontal = true;
        this.videoWidth = 640;
        this.videoHeight = 480;
        this.minPoseConfidence = 0.1;
        this.minPartConfidence = 0.5;
    }

    detectPoseInRealTime() {
        const canvas = document.getElementById('detectionOutput');
        this.ctx = canvas.getContext('2d');

        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;

        this.poseDetectionFrame();
    }

    poseDetectionFrame() {
        this.net.estimateSinglePose(this.video, this.imageScaleFactor, this.flipHorizontal, this.outputStride)
        .then(pose => {
            console.log(pose);
            this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);

            this.ctx.save();
            this.ctx.scale(-1, 1);
            this.ctx.translate(-this.videoWidth, 0);
            this.ctx.drawImage(this.video, 0, 0, this.videoWidth, this.videoHeight);
            this.ctx.restore();

            if (pose.score >= this.minPoseConfidence) {
                this.drawKeypoints(pose.keypoints, this.minPartConfidence, this.ctx);
                this.drawSkeleton(pose.keypoints, this.minPartConfidence, this.ctx);
            }

            requestAnimationFrame(this.poseDetectionFrame.bind(this));
        })
    }

    bindPage() {
        posenet.load(0.75)
        .then(net => {
            this.net = net;
            document.getElementById('detectionContainer').style.display = 'block';
            document.getElementById('loader').style.display = 'none';

            this.loadVideo()
            .then(video => {
                this.video = video;

                this.detectPoseInRealTime();
            })
        })
    }

    loadVideo() {
        return new Promise((resolve) => {
            this.setupCamera()
            .then(video => {
                video.play();

                resolve(video);
            });
        });
    }

    setupCamera() {
        return new Promise((resolve) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error(
                    'Browser API navigator.mediaDevices.getUserMedia not available');
            }

            const video = document.getElementById('video');
            video.width = this.videoWidth;
            video.height = this.videoHeight;

            const mobile = this.isMobile();

            navigator.mediaDevices.getUserMedia({
                'audio': false,
                'video': {
                    facingMode: 'user',
                    width: mobile ? undefined : this.videoWidth,
                    height: mobile ? undefined : this.videoHeight,
                },
            }).then(function(stream) {
                video.srcObject = stream;

                
                video.onloadedmetadata = () => {
                    resolve(video);
                };
            });
        });
    }

    /**
     * Draws a pose skeleton by looking up all adjacent keypoints/joints
     */
    drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
        const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
        adjacentKeyPoints.forEach((keypoints) => {
            this.drawSegment(this.toTuple(keypoints[0].position), this.toTuple(keypoints[1].position), '#1cff00', scale, ctx);
        });
    }

    /**
     * Draw pose keypoints onto a canvas
     */
    drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
        for (let i = 0; i < keypoints.length; i++) {
            const keypoint = keypoints[i];

            if (keypoint.score < minConfidence) {
                continue;
            }

            const {y, x} = keypoint.position;
            this.drawPoint(ctx, y * scale, x * scale, 3, 'yellow');
        }
    }

    /**
     * Draws a line on a canvas, i.e. a joint
     */
    drawSegment([ay, ax], [by, bx], color, scale, ctx) {
        ctx.beginPath();
        ctx.moveTo(ax * scale, ay * scale);
        ctx.lineTo(bx * scale, by * scale);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    drawPoint(ctx, y, x, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    toTuple({y, x}) {
        return [y, x];
    }

    isMobile() {
        return this.isAndroid() || this.isiOS();
    }
    
    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    isiOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
}

var poseEstimator = new PoseEstimator();

poseEstimator.bindPage();