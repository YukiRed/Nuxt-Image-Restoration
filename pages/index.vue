<template>
    <div v-if="pageLoaded" class="container">
        <div class="upload-section">
            <UCard class="upload-card">
                <div class="drop-area" @dragover.prevent @drop.prevent="onDrop" @dragenter="dragging = true"
                    @dragleave="dragging = false" :class="{ 'dragging': dragging }">
                    <p v-if="!file">Drag and drop an image or click to select</p>
                    <p v-if="file">

                        <NuxtImg :src="originalImage" alt="Original Image" />

                    </p>
                    <input type="file" @change="onFileChange" accept="image/*" />
                </div>
                <button class="mt-20" type="submit" @click="submitImage" :disabled="isProcessing">
                    <span v-if="isProcessing">Processing...</span>
                    <span v-else>Upload and Colorize</span>
                </button>
            </UCard>
        </div>

        <div class="images-section">
            <div class="colorized-image">
                <UCard class="image-card">
                    <template #header>
                        <h3>Colorized Image</h3>
                    </template>
                    <!-- Image Comparison Slider for Original and Colorized Image -->
                    <ImgComparisonSlider v-if="colorizedImage" class="slider">
                        <img slot="first" style="width: 100%" :src="originalImage" />
                        <img slot="second" style="width: 100%" :src="colorizedImage" />
                    </ImgComparisonSlider>
                </UCard>
            </div>
        </div>
    </div>

    <div v-else class="loading-spinner">
        <div class="spinner"></div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { ImgComparisonSlider } from '@img-comparison-slider/vue'

    const originalImage = ref(null)
    const colorizedImage = ref(null)
    const file = ref(null)
    const dragging = ref(false)
    const isProcessing = ref(false)
    const pageLoaded = ref(false)

    onMounted(() => {
        pageLoaded.value = true
    })

    const onFileChange = (e) => {
        const files = e.target.files
        if (files.length) {
            file.value = files[0]
            const reader = new FileReader()

            reader.onloadend = () => {
                originalImage.value = reader.result
            }

            reader.readAsDataURL(files[0])
        }
    }

    const onDrop = (e) => {
        const files = e.dataTransfer.files
        if (files.length) {
            file.value = files[0]
            const reader = new FileReader()

            reader.onloadend = () => {
                originalImage.value = reader.result
            }

            reader.readAsDataURL(files[0])
            dragging.value = false
        }
    }

    const submitImage = async () => {
        if (!file.value) return
        isProcessing.value = true

        const formData = new FormData()
        formData.append('image', file.value)

        try {
            const response = await fetch('/api/colorize', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()
            colorizedImage.value = `data:image/jpeg;base64,${result.result}`

        } catch (error) {
            console.error("Error during image processing:", error)
        } finally {
            isProcessing.value = false
        }
    }
</script>

<style scoped>
    .container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        padding: 40px;
    }

    .upload-section {
        width: 45%;
        margin-right: 20px;
    }

    .images-section {
        width: 45%;
    }

    .upload-card,
    .image-card {
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .drop-area {
        border: 2px dashed #ccc;
        padding: 20px;
        cursor: pointer;
        margin-bottom: 20px;
    }

    .dragging {
        border-color: #007BFF;
        background-color: rgba(0, 123, 255, 0.1);
    }

    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    img {
        max-width: 100%;
        height: auto;
        max-height: 75vh;
        border-radius: 5px;
    }

    .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
</style>