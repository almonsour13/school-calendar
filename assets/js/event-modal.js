// Modal and form elements
const modal = document.getElementById("add-event-modal");
const modalContainer = document.getElementById("modal-container");
const closeModalBtn = document.getElementById("close-add-event");
const cancelBtn = document.getElementById("cancel-btn");
const eventForm = document.getElementById("eventForm");

// Input fields
const title = document.getElementById("title");
const dateInput = document.getElementById("date");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const description = document.getElementById("description");
const venue = document.getElementById("venue");
const typeSelect = document.getElementById("type");
const customTypeInput = document.getElementById("customType");
const colorInput = document.getElementById("color");
const addCustomTypeBtn = document.getElementById('addCustomTypeBtn');

let currentEditId = null;

const eventTypes = ["Exam", "Event", "Meeting"];
const eventColors = ["white", "gray", "red", "yellow", "green", "blue", "purple", "pink"];

// Populate event type options
eventTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
});

// Populate color options
eventColors.forEach(color => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `color-option rounded-full w-8 h-8 ${color === 'white' ? 'bg-white' : `bg-${color}-500`} hover:opacity-75 transition duration-200`;
    button.onclick = () => selectColor(color);
    document.querySelector("#colorOptions").appendChild(button);

    if (color === "white") {
        button.classList.add("ring-2", "ring-blue-200");
        colorInput.value = color; // Set initial color input value
    }
});

function openEventModalForm(param = null) {
    const dateFormatRegex = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \([A-Za-z\s]+\)$/;
    const headerTitle = document.getElementById('add-event-modal-header-title');

    // Hide existing modal if visible
    const dayEventModal = document.getElementById('eventModal');
    if (!dayEventModal.classList.contains('hidden')) {
        dayEventModal.classList.add('hidden');
    }

    if (param) {
        // Validate the date format
        if (typeof param === 'string' && dateFormatRegex.test(param)) {
            const date = new Date(param);
            dateInput.value = date.toISOString().substring(0, 10);
            headerTitle.innerText = `Add Event on ${date.toLocaleDateString()}`;
        } else {
            currentEditId = param;
            const event = getEventById(currentEditId);
            headerTitle.innerText = 'Edit Event';

            if (event) {
                // Set values
                populateEventForm(event);
            } else {
                console.error(`No event found with ID: ${currentEditId}`);
            }
        }
    } else {
        resetEventForm(); // Reset the form if param is falsy
        headerTitle.innerText = 'Add Event';
    }

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

function populateEventForm(event) {
    title.value = event.title || '';
    dateInput.value = new Date(event.date).toISOString().substring(0, 10);
    startTime.value = formatTime(event.startTime) || '';
    endTime.value = formatTime(event.endTime) || '';
    description.value = event.description || '';
    typeSelect.value = event.type || '';
    venue.value = event.venue ?? '';

    selectColor(event.color || 'white'); // Set initial color and style
    updateModalBackgroundColor(event.color || 'white');
}

function resetEventForm() {
    eventForm.reset(); // Reset the form
    selectColor("white"); // Change color to white
}

function updateModalBackgroundColor(color) {
    modalContainer.classList.forEach(className => {
        if (className.startsWith("bg-")) {
            modalContainer.classList.remove(className);
        }
    });
    modalContainer.classList.add(color === 'white' ? 'bg-white' : `bg-${color}-100`);
}

function formatTime(time) {
    if (time) {
        const [hours, minutes] = time.split(':');
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return '';
}

function closeAddEventModal() {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    resetEventForm(); // Reset the form and modal state
    currentEditId = null;
    resetModalStyle();
}

function resetModalStyle() {
    [title, dateInput, startTime, endTime, description, typeSelect, customTypeInput, venue].forEach(input => {
        input.classList.remove(...Array.from(input.classList).filter(className => className.startsWith('border-') || className.startsWith('bg-')));
        input.classList.add('border', 'border-gray-300', 'bg-white'); // Set default classes
    });
    updateModalBackgroundColor("white"); // Set default background color
}

closeModalBtn.addEventListener("click", closeAddEventModal);
cancelBtn.addEventListener("click", closeAddEventModal);

addCustomTypeBtn.addEventListener("click", () => {
    const customType = customTypeInput.value.trim();
    if (customType) {
        const option = document.createElement("option");
        option.value = customType;
        option.textContent = customType;
        typeSelect.appendChild(option);
        
        // Set the new option as selected
        option.selected = true;

        customTypeInput.value = '';
    }
});

window.selectColor = function(color) {
    colorInput.value = color;
    const colorOptions = document.querySelectorAll(".color-option");

    // Update color button styles
    colorOptions.forEach(option => {
        option.classList.remove("ring-2", "border-black");
    });

    // Change the input field styles based on the selected color
    [title, dateInput, startTime, endTime, description, typeSelect, customTypeInput,venue].forEach(input => {
        input.classList.remove(...Array.from(input.classList).filter(className => className.startsWith('border-') || className.startsWith('bg-')));
        input.classList.add('border', `border-${color === 'white' ? 'gray-300' : color + '-200'}`, `bg-${color === 'white' ? 'white' : color + '-200'}`);
    });

    // Highlight the selected color button
    const selectedButton = [...colorOptions].find(option => option.className.includes(`bg-${color}-500`));
    if (selectedButton) {
        selectedButton.classList.add("ring-2", `border-${color}-400`);
    }

    updateModalBackgroundColor(color);
};

eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const formData = new FormData(eventForm);
    const eventData = Object.fromEntries(formData.entries());
    const inputDate = new Date(eventData.date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (inputDate < currentDate) {
        alert("The selected date is in the past. Please choose a future date.");
        return;
    }

    // Update event
    if (currentEditId) {
        eventData.date = inputDate;
        const event = events.find(e => String(e.id) === String(currentEditId));
        if (event) {
            Object.assign(event, eventData); // Update event properties
            localStorage.setItem('events', JSON.stringify(events));
            console.log("Event updated:", eventData);
            showToast("Event updated")
            currentEditId = null;
        }
    } else {
        eventData.id = getNextId();
        eventData.date = inputDate;
        events.push(eventData);
        localStorage.setItem("events", JSON.stringify(events));
        showToast("Event Added")
    }

    loadCalendar();
    updateMonthEvents();
    closeAddEventModal(); // Close modal instead of closeModal
});

function getEventById(id) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    return events.find(event => event.id == id);
}

function getNextId() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    return events.length ? Math.max(...events.map(event => event.id)) + 1 : 1;
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeAddEventModal(); // Change to closeAddEventModal for clarity
    }
});

window.addEventListener("popstate", () => {
    if (!modal.classList.contains("hidden")) {
        closeAddEventModal(); // Change to closeAddEventModal for clarity
    }
});
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastContent = toast.querySelector('p');
    
    toastContent.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.add('fade-out');
    }, 2000);

    setTimeout(() => {
        toast.classList.remove('show', 'fade-out');
    }, 2500);
}
