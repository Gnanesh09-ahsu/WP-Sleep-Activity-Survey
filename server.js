require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// -----------------------------
// Middleware
// -----------------------------

app.use(express.json({ limit: "50kb" }));

app.use(express.static(path.join(__dirname, "public")));


// -----------------------------
// Supabase
// -----------------------------

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Missing Supabase environment variables.");
}

const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    }
);


// -----------------------------
// Submit Survey
// -----------------------------

app.post("/api/submit", async (req, res) => {

    try {

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


        // -----------------------------
        // Required field validation
        // -----------------------------

        if (
            !age ||
            !course ||
            !phone ||
            !sleepHours ||
            !sleepQuality ||
            consent !== true
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required fields and accept the consent."
            });
        }


        // -----------------------------
        // Validate age
        // -----------------------------

        const numericAge = Number(age);

        if (
            !Number.isInteger(numericAge) ||
            numericAge < 15 ||
            numericAge > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid age."
            });
        }


        // -----------------------------
        // Validate Indian phone number
        // -----------------------------

        const cleanPhone = String(phone).replace(/\s+/g, "");

        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(cleanPhone)) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit Indian mobile number."
            });

        }


        // -----------------------------
        // Clean sleep factors
        // -----------------------------

        const validSleepFactors = Array.isArray(sleepFactors)
            ? sleepFactors
                .filter(item => typeof item === "string")
                .slice(0, 10)
            : [];


        // -----------------------------
        // Prepare database record
        // -----------------------------

        const surveyResponse = {

            name:
                typeof name === "string"
                    ? name.trim().slice(0, 100)
                    : null,

            age: numericAge,

            course:
                String(course)
                    .trim()
                    .slice(0, 100),

            phone: cleanPhone,

            sleep_hours:
                String(sleepHours)
                    .trim()
                    .slice(0, 50),

            sleep_quality:
                String(sleepQuality)
                    .trim()
                    .slice(0, 50),

            phone_before_sleep:
                typeof phoneBeforeSleep === "string"
                    ? phoneBeforeSleep.slice(0, 50)
                    : null,

            sleepy_in_class:
                typeof sleepyInClass === "string"
                    ? sleepyInClass.slice(0, 50)
                    : null,

            sleep_difficulty:
                typeof sleepDifficulty === "string"
                    ? sleepDifficulty.slice(0, 50)
                    : null,

            sleep_factors: validSleepFactors,

            academic_effect:
                typeof academicEffect === "string"
                    ? academicEffect.slice(0, 50)
                    : null,

            comments:
                typeof comments === "string"
                    ? comments.trim().slice(0, 1000)
                    : null,

            consent: true
        };


        // -----------------------------
        // Insert into Supabase
        // -----------------------------

        const { error } = await supabase
            .from("sleep_survey_responses")
            .insert([surveyResponse]);


        if (error) {

            console.error("Database error:", error.message);

            return res.status(500).json({
                success: false,
                message: "Unable to save your response. Please try again."
            });

        }


        // -----------------------------
        // Success
        // -----------------------------

        return res.status(201).json({
            success: true,
            message: "Thank you! Your response has been recorded."
        });


    } catch (error) {

        console.error("Server error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });

    }

});


// -----------------------------
// Health Check
// -----------------------------

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "Sleep Survey API is running."
    });

});


// -----------------------------
// Local development
// -----------------------------

if (require.main === module) {

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {

        console.log(
            `Survey running at http://localhost:${PORT}`
        );

    });

}


// -----------------------------
// Export for Vercel
// -----------------------------

module.exports = app;