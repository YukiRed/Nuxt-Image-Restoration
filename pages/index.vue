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
                    <NuxtImg :src="colorizedImage" alt="Colorized Image" />
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

    const originalImage = ref(null)
    const colorizedImage = ref(null)
    const file = ref(null)
    const dragging = ref(false)
    const isProcessing = ref(false) // Track the processing status
    const pageLoaded = ref(false) // Track the page load status

    onMounted(() => {
        // Set the pageLoaded to true when the page is fully loaded
        pageLoaded.value = true
    })


    const onFileChange = (e) => {
        const files = e.target.files
        if (files.length) {
            file.value = files[0]
            originalImage.value = URL.createObjectURL(files[0])
        }
    }

    const onDrop = (e) => {
        const files = e.dataTransfer.files
        if (files.length) {
            file.value = files[0]
            originalImage.value = URL.createObjectURL(files[0])
            dragging.value = false
        }
    }

    const submitImage = async () => {
        if (!file.value) return; // Don't submit if no file is selected
        isProcessing.value = true // Disable the button

        const formData = new FormData()
        formData.append('image', file.value)

        try {
            const response = await fetch('/api/colorize', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()
            colorizedImage.value = `data:image/jpeg;base64,${result.result}`
        } catch (error) {
            console.error("Error during image processing:", error)
        } finally {
            isProcessing.value = false // Re-enable the button once processing is done
        }
    }
</script>

<style scoped>
    .container {
        display: flex;
        /* Change to row layout */
        flex-direction: row;
        /* Arrange upload and images section side by side */
        justify-content: space-between;
        /* Add space between sections */
        align-items: flex-start;
        /* Align items at the start */
        padding: 40px;
    }

    .upload-section {
        width: 45%;
        /* Keep the upload section on the left */
        margin-right: 20px;
        /* Add some spacing to the right */
    }

    .images-section {
        width: 45%;
        /* Keep the image section on the right */
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
        border-radius: 5px;
    }

    .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        /* Full height of the viewport */
    }

    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        /* Light gray border */
        border-top: 4px solid #3498db;
        /* Blue spinner border */
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        /* Spin animation */
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
