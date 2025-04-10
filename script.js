function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
  }
  
  // SYMPTOM CHECKER
  function submitSymptoms() {
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
    const checkboxes = document.getElementsByName("symptom");
    const symptoms = [];
  
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        symptoms.push({
          id: checkboxes[i].value,
          choice_id: "present"
        });
      }
    }
  
    const postData = {
      sex: gender,
      age: {
        value: parseInt(age),
        unit: "year"
      },
      evidence: symptoms
    };
  
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      const diagnosis = document.getElementById("diagnosis");
      const triageAnalysis = document.getElementById("triage-analysis");
  
      if (this.readyState === 4) {
        if (this.status === 200) {
          const response = JSON.parse(this.responseText);
          if (response.conditions && response.conditions.length > 0) {
            const condition = response.conditions[0];
            diagnosis.innerHTML = `You may have <b>${condition.name}</b> with a probability of <b>${(condition.probability * 100).toFixed(2)}%</b>.`;
  
            // Fetch condition details
            getConditionDetails(condition.id);
  
            // Perform triage analysis
            getTriageAnalysis(postData);
          } else {
            diagnosis.innerHTML = "No likely condition detected.";
          }
        } else {
          diagnosis.innerHTML = "Error fetching diagnosis.";
        }
      }
    };
  
    xhr.open("POST", "https://api.infermedica.com/v3/diagnosis");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("App-Id", "626aee6c"); 
    xhr.setRequestHeader("App-Key", "c3a94dfc8823ae4398fe14df6e8a4d3c");
    xhr.setRequestHeader("Model", "infermedica-en");
    xhr.send(JSON.stringify(postData));
  }
  
  function getTriageAnalysis(postData) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      const triageAnalysis = document.getElementById("triage-analysis");
  
      if (this.readyState === 4) {
        if (this.status === 200) {
          const response = JSON.parse(this.responseText);
          triageAnalysis.innerHTML = `Triage Level: <b>${response.triage_level}</b>`;
          console.log("Triage Analysis:", response);
        } else {
          triageAnalysis.innerHTML = "Error fetching triage analysis.";
          console.error("Error fetching triage analysis.");
        }
      }
    };
  
    xhr.open("POST", "https://api.infermedica.com/v3/triage");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("App-Id", "626aee6c");
    xhr.setRequestHeader("App-Key", "c3a94dfc8823ae4398fe14df6e8a4d3c");
    xhr.setRequestHeader("Model", "infermedica-en");
    xhr.send(JSON.stringify(postData));
  }
  
  // HOSPITAL LOCATOR
  function findNearbyPlaces() {
    const apiKey = "2a924d7f92ce4442bbbbc68a9315f45f"; 
  
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(success, error);
  
    function success(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const categories = "healthcare.hospital,healthcare.pharmacy";
  
      const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=5&apiKey=${apiKey}`;
  
      fetch(url)
        .then(res => res.json())
        .then(data => showResults(data.features))
        .catch(err => {
          console.error(err);
          document.getElementById("results").innerHTML = "<p>Error fetching location data.</p>";
        });
    }
  
    function error() {
      alert("Location access denied.");
    }
  
    function showResults(places) {
      const results = document.getElementById("results");
      results.innerHTML = "";
  
      if (places.length === 0) {
        results.innerHTML = "<p>No nearby places found.</p>";
        return;
      }
  
      const list = document.createElement("ul");
      places.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${p.properties.name || "Unnamed"}</strong><br>
          ${p.properties.address_line1 || ""}<br>
          ${p.properties.address_line2 || ""}
        `;
        list.appendChild(li);
      });
      results.appendChild(list);
    }
  }
  