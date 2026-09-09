const form = document.getElementById("surveyForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const phone = document.getElementById("phone").value.trim();

    const sleepFactors = [
        ...document.querySelectorAll(
            'input[name="sleepFactors"]:checked'
        )
    ].map(item => item.value);

    const data = {

        name: document.getElementById("name").value.trim(),

        age: document.getElementById("age").value,

        course: document.getElementById("course").value.trim(),

        phone: phone,

        sleepHours:
            document.querySelector(
                'input[name="sleepHours"]:checked'
            )?.value,

        sleepQuality:
            document.querySelector(
                'input[name="sleepQuality"]:checked'
            )?.value,

        phoneBeforeSleep:
            document.getElementById("phoneBeforeSleep").value,

        sleepyInClass:
            document.getElementById("sleepyInClass").value,

        sleepDifficulty:
            document.getElementById("sleepDifficulty").value,

        sleepFactors: sleepFactors,

        academicEffect:
            document.getElementById("academicEffect").value,

        comments:
            document.getElementById("comments").value.trim(),

        consent:
            document.getElementById("consent").checked
    };


    try {

        const response = await fetch("/api/submit", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });


        const result = await response.json();


        if (result.success) {

            message.textContent = result.message;
            message.className = "success";

            form.reset();

        } else {

            message.textContent = result.message;
            message.className = "error";
        }

    } catch (error) {

        message.textContent =
            "Something went wrong. Please try again.";

        message.className = "error";
    }

});