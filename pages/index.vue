<template>
    <div class="container">
        <div class="upload-section">
            <UCard class="upload-card">
                <div class="drop-area" @dragover.prevent @drop.prevent="onDrop" @dragenter="dragging = true"
                    @dragleave="dragging = false" :class="{ 'dragging': dragging }">
                    <p v-if="!file">Drag and drop an image or click to select</p>
                    <p v-if="file">File selected: {{ file.name }}</p>
                    <input type="file" @change="onFileChange" accept="image/*" />
                </div>
                <button class="mt-20" type="submit" @click="submitImage">Upload and Colorize</button>
            </UCard>
        </div>

        <div class="images-section">
            <div class="original-image">
                <UCard class="image-card">
                    <template #header>
                        <h3>Original Image</h3>
                    </template>
                    <NuxtImg :src="originalImage" alt="Original Image" />
                </UCard>
            </div>

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
</template>

<script setup>
    import { ref } from 'vue'

    const originalImage = ref(null)
    const colorizedImage = ref(null)
    const file = ref(null)
    const dragging = ref(false)

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
        const formData = new FormData()
        formData.append('image', file.value)

        const response = await fetch('/api/colorize', {
            method: 'POST',
            body: formData
        })

        const result = await response.json()
        colorizedImage.value = `data:image/jpeg;base64,${result.result}`
    }
</script>

<style scoped>
    .container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 40px;
    }

    .upload-section {
        align-self: flex-start;
        width: 45%;
        margin-bottom: 20px;
    }

    .images-section {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .original-image,
    .colorized-image {
        width: 45%;
        max-height: 40vh;
    }

    .upload-card,
    .image-card {
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

    img {
        max-width: 100%;
        height: auto;
        border-radius: 5px;
    }
</style>