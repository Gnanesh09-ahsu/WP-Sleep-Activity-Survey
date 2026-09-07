const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const filePath = path.join(__dirname, "responses.json");

app.post("/api/submit", (req, res) => {
    const {
        name,
        age,
        course,
        phone,
        sleepHours,
        sleepQuality,
        phoneBeforeSleep,
        sleepyInClass,
        sleepDifficulty,
        sleepFactors,
        academicEffect,
        comments,
        consent
    } = req.body;

    // Basic validation
    if (!phone || !age || !course || !sleepHours || !sleepQuality || !consent) {
        return res.status(400).json({
            success: false,
            message: "Please complete all required fields."
        });
    }

    // Basic Indian phone-number validation
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid 10-digit Indian mobile number."
        });
    }

    const response = {
        id: Date.now(),
        name: name || "Anonymous",
        age,
        course,
        phone,
        sleepHours,
        sleepQuality,
        phoneBeforeSleep,
        sleepyInClass,
        sleepDifficulty,
        sleepFactors,
        academicEffect,
        comments: comments || "",
        consent: true,
        submittedAt: new Date().toISOString()
    };

    let responses = [];

    try {
        responses = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        responses = [];
    }

    responses.push(response);

    fs.writeFileSync(
        filePath,
        JSON.stringify(responses, null, 2)
    );

    res.json({
        success: true,
        message: "Thank you! Your response has been recorded."
    });
});

app.listen(PORT, () => {
    console.log(`Survey running at http://localhost:${PORT}`);
});