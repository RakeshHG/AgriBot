document.getElementById("sendButton").addEventListener("click", function() {
    const chatWindow = document.getElementById("chat-window");
    const imageInput = document.getElementById("imageInput").files[0];
    const loadingIndicator = document.getElementById("loading");

    if (!imageInput) {
        showToast("Please select an image.");
        return;
    }

    // Show loading indicator
    loadingIndicator.classList.remove("hidden");

    const reader = new FileReader();
    reader.readAsDataURL(imageInput);
    reader.onload = function() {
        const imageData = reader.result.split(",")[1]; // Get base64 string
        const originalImageSrc = reader.result;
        displayImagePreview(originalImageSrc);  // Display the original image preview
        displayMessage("Image sent for analysis...", "user-message");
        sendImageToRoboflow(imageData, originalImageSrc);
    };

    function sendImageToRoboflow(base64Image, originalImageSrc) {
        axios({
            method: "POST",
            url: "https://detect.roboflow.com/tomato-leaves-f4rat/2",
            params: {
                api_key: "OZUmLjNBWc7ZkAUWnClo"
            },
            data: base64Image,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(function(response) {
            loadingIndicator.classList.add("hidden");
            const predictions = response.data.predictions;
            if (predictions.length > 0) {
                drawBoundingBoxes(originalImageSrc, predictions);
                predictions.forEach(prediction => {
                    displayMessage(`Disease Detected: ${prediction.class}`, "bot-message");
                    displayCausesAndRemedies(prediction.class);
                });
            } else {
                displayMessage("No disease detected or no bounding boxes returned.", "bot-message");
            }
        })
        .catch(function(error) {
            loadingIndicator.classList.add("hidden");
            displayMessage("Error: " + error.message, "bot-message");
        });
    }

    function displayMessage(text, className) {
        const messageElement = document.createElement("p");
        messageElement.classList.add(className);
        messageElement.textContent = text;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function displayImagePreview(imageSrc) {
        const imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.alt = "Selected Image";
        imgElement.style.maxWidth = "100%";
        imgElement.style.borderRadius = "10px";
        imgElement.style.marginBottom = "10px";
        chatWindow.appendChild(imgElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function drawBoundingBoxes(imageSrc, predictions) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = function() {
            const canvas = document.getElementById("resultCanvas");
            const ctx = canvas.getContext("2d");

            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Draw each bounding box on the image
            predictions.forEach(prediction => {
                const { x, y, width, height } = prediction.bbox;
                const color = "red";
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;

                // Convert center x,y to top-left x,y for canvas
                const startX = x - width / 2;
                const startY = y - height / 2;

                // Draw rectangle for the bounding box
                ctx.strokeRect(startX, startY, width, height);

                // Optional: Add label above the bounding box
                ctx.fillStyle = color;
                ctx.font = "16px Arial";
                ctx.fillText(prediction.class, startX, startY - 5);
            });

            displayMessage("Bounding boxes added to the image.", "bot-message");
        };
    }

    function displayCausesAndRemedies(disease) {
        const remedies = getRemedies(disease);
        const causesMessage = document.createElement("p");
        causesMessage.classList.add("bot-message");
        causesMessage.innerHTML = remedies.causes;
        chatWindow.appendChild(causesMessage);
        
        const remediesMessage = document.createElement("p");
        remediesMessage.classList.add("bot-message");
        remediesMessage.innerHTML = remedies.remedies;
        chatWindow.appendChild(remediesMessage);

        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function getRemedies(disease) {
        let causes = "";
        let remedies = "";
        switch (disease.toLowerCase()) {
            case "bacterial spot":
                causes = `<strong>Causes:</strong> Bacteria spread through infected seeds or water.`;
                remedies = `<strong>Remedies:</strong> Use copper-based bactericides, remove and destroy infected plants, ensure good air circulation.`;
                break;
            case "early blight":
                causes = `<strong>Causes:</strong> Fungus (Alternaria solani) spread by wind, water, and contact.`;
                remedies = `<strong>Remedies:</strong> Apply fungicides, practice crop rotation, remove infected leaves, avoid overhead watering.`;
                break;
            case "healthy":
                causes = `<strong>Causes:</strong> Your plant is healthy!`;
                remedies = `<strong>Remedies:</strong> Continue proper care to maintain its health.`;
                break;
            case "iron deficiency":
                causes = `<strong>Causes:</strong> Lack of iron in the soil, often in alkaline soil conditions.`;
                remedies = `<strong>Remedies:</strong> Apply iron chelates to the soil, reduce soil pH if necessary, and ensure proper watering practices.`;
                break;
            case "late blight":
                causes = `<strong>Causes:</strong> Fungus (Phytophthora infestans) spread by wind and water.`;
                remedies = `<strong>Remedies:</strong> Apply fungicides regularly, remove and destroy infected plants, avoid overhead watering, and practice crop rotation.`;
                break;
            case "leaf mold":
                causes = `<strong>Causes:</strong> Fungus (Passalora fulva) thriving in high humidity and poor air circulation.`;
                remedies = `<strong>Remedies:</strong> Reduce humidity, improve air circulation, apply fungicides, and remove affected leaves.`;
                break;
            case "leaf_miner":
                causes = `<strong>Causes:</strong> Larvae of certain insects burrowing into leaves.`;
                remedies = `<strong>Remedies:</strong> Remove affected leaves, use insecticidal sprays, introduce natural predators like parasitic wasps.`;
                break;
            case "mosaic virus":
                causes = `<strong>Causes:</strong> Viral infection spread by insects like aphids.`;
                remedies = `<strong>Remedies:</strong> Remove and destroy infected plants, control insect vectors with insecticides, and plant resistant varieties.`;
                break;
            case "septoria":
                causes = `<strong>Causes:</strong> Fungus (Septoria lycopersici) spread by water splash.`;
                remedies = `<strong>Remedies:</strong> Apply fungicides, remove infected leaves, ensure good air circulation, and avoid overhead watering.`;
                break;
            case "spider mites":
                causes = `<strong>Causes:</strong> Infestation of spider mites, often in hot, dry conditions.`;
                remedies = `<strong>Remedies:</strong> Use miticides, increase humidity, introduce natural predators like ladybugs, and regularly spray plants with water.`;
                break;
            case "yellow leaf curl virus":
                causes = `<strong>Causes:</strong> Viral infection transmitted by whiteflies.`;
                remedies = `<strong>Remedies:</strong> Control whitefly populations, remove infected plants, use reflective mulches to repel insects, and plant resistant varieties.`;
                break;
            default:
                causes = `<strong>Causes:</strong> No specific causes available for this disease.`;
                remedies = `<strong>Remedies:</strong> No specific remedies available for this disease.`;
                break;
        }
        return { causes, remedies };
    }

    function showToast(message) {
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 100);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
});
