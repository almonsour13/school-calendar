
function fetchEventData(){
    const storedEvents = localStorage.getItem('events');
    const events = storedEvents ? JSON.parse(storedEvents) : []; 
    return events;
}
let currentDate = new Date();

function updateCurrentMonthYear() {
    document.getElementById('currentMonthYear').textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
}
let activeTab = 'thisMonth';
function showTab(tabName) {
    const tabs = ['thisMonth', 'all', 'upcoming'];
    activeTab = tabName;  // Update the active tab
    tabs.forEach(tab => {
        const button = document.getElementById(`${tab}Tab`);
        if (tab === tabName) {
            button.classList.add('bg-gray-200');
            button.classList.remove('text-gray-500');
        } else {
            button.classList.remove('bg-gray-200');
            button.classList.add('text-gray-500');
        }
    });
    updateMonthEvents()
}
function updateMonthEvents() {
    const monthEventsElement = document.getElementById('monthEvents');
    if (!monthEventsElement) return; // Ensure the element exists
    const events = fetchEventData()
    const THIS_MONTH = 'thisMonth';
    const UPCOMING = 'upcoming';
    
    let filteredEvents;
    
    if (activeTab === THIS_MONTH) {
        filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date); // Convert event.date to a Date object
            return (
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()
            );
        });
    } else if (activeTab === UPCOMING) {
        filteredEvents = events.filter(event => new Date(event.date) > currentDate); // Ensure event.date is a Date object
    } else {
        filteredEvents = events; // Show all events
    }
    
    let monthEventsHTML = '';
    if (filteredEvents.length > 0) {
        filteredEvents.forEach((event, index) => {
            monthEventsHTML += eventCard(event, index);
        });
    } else {
        monthEventsHTML += '<div class="rounded-xl text-gray-500 text-center p-4 bg-gray-100 fade-in">No events this month.</div>';
    }

    monthEventsElement.innerHTML = monthEventsHTML;
}
function loadCalendar() {
    const events = fetchEventData()
    const calendarElement = document.getElementById('calendar');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const monthEventsElementTitle = document.getElementById('thisMonthTab');
    monthEventsElementTitle.textContent = `${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    
    // Get the last day of the current month
    const lastDay = new Date(year, month, daysInMonth);
    
    // Get the total number of days in the previous month
    const prevDaysInMonth = new Date(year, month, 0).getDate();

    // Get the number of days to display from the previous month
    const prevMonthDaysToShow = firstDay === 0 ? 6 : firstDay - 1;

    let calendarHTML = '<div class=""><div class="grid grid-cols-7 text-sm font-medium gap-2">';
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add day headers
    daysOfWeek.forEach(day => {
        calendarHTML += `<div class="p-0 py-2 rounded-3xl font-semibold bg-yellow-1a00 md:px-4 md:bg-gray-as100 text-center md:text-left rounded-xl">${day}</div>`;
    });
    
    calendarHTML += '</div></div><div class="grid grid-cols-7 gap-2">';

    // Add days from the previous month
    // for (let i = prevDaysInMonth - prevMonthDaysToShow; i <= prevDaysInMonth; i++) {
    //     const date = new Date(year, month - 1, i); // Previous month
    //     calendarHTML += `
    //         <div class="relative flex flex-col items-center justify-center md:items-start md:justify-start p-2 rounded-full md:rounded-2xl h-auto md:h-[100px] bg-gray-200 cursor-default opacity-50">
    //             <div class="flex items-center justify-center w-10 lg:w-8 h-10 lg:h-8 text-center md:text-left text-base md:text-sm font-semibold">
    //                 ${i}
    //             </div>
    //         </div>
    //     `;
    // }
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="p-2"></div>';
    }

    // Add days for the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const dayEvents = events.filter(event => {
            // Create a new date object from the event date to ensure proper comparison
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    
        calendarHTML += `
            <div class="relative flex flex-col items-center justify-center md:items-start md:justify-start p-2 rounded-full md:rounded-xl h-auto md:h-[100px] 
            ${isToday ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-200 ease-in-out fade-in cursor-pointer" style="animation-delay: ${day * 50}ms" onclick="showDayEvents(${year}, ${month}, ${day})">
                <div class="flex items-center justify-center w-full rounded-full w-10 lg:w-8 h-10 lg:h-8 text-center md:text-left text-base md:text-sm font-semibold ${isToday ? 'text-blue-600' : ''}">
                    ${day}
                </div>
                ${dayEvents.slice(0, 2).map(event => `
                    <div class="text-xs font-semibold mt-1 hidden md:block p-1 w-full text-left truncate ${"bg-"+event.color+"-100"} ${"text-"+event.color+"-800"} rounded">
                        <span>${event.title}</span>
                    </div>
                `).join('')}
                ${dayEvents.length > 2 ? `
                    <div class="text-xs hidden md:block w-full text-left text-gray-500 font-semibold">
                        +${dayEvents.length - 2} more
                    </div>` : ''}
                <span class="${dayEvents.length == 0 ? "hidden" : ""} md:hidden absolute -top-1 -right-1 h-5 w-5 p-1 sm:h-6 sm:w-6 bg-green-100 text-green-800 font-bold text-sm text-center rounded-full flex items-center justify-center">${dayEvents.length}</span>
            </div>
        `;
    }    

    // Calculate how many days to show in the next month
    const nextMonthDaysToShow = (7 - (firstDay + daysInMonth) % 7) % 7;

    // Add days from the next month
    // for (let i = 1; i <= nextMonthDaysToShow; i++) {
    //     calendarHTML += `
    //         <div class="relative flex flex-col items-center justify-center md:items-start md:justify-start p-2 rounded-full md:rounded-2xl h-auto md:h-[100px] bg-gray-200 cursor-default opacity-50">
    //             <div class="flex items-center justify-center w-10 lg:w-8 h-10 lg:h-8 text-center md:text-left text-base md:text-sm font-semibold">
    //                 ${i}
    //             </div>
    //         </div>
    //     `;
    // }

    calendarHTML += '</div>';
    calendarElement.innerHTML = calendarHTML;

    const dayDivs = document.querySelectorAll("#calendar > div:last-child > div");

    function applyWidthToHeight() {
        dayDivs.forEach((element) => {
            const width = element.clientWidth;
            element.style.height = `${width}px`;
        });
    }

    applyWidthToHeight();
    window.addEventListener("resize", applyWidthToHeight);

    if(activeTab == "thisMonth"){
        updateMonthEvents();
    }
}
function showDayEvents(year, month, day) {
    const events = fetchEventData();

    // Create a date object for the specified year, month, and day
    const date = new Date(year, month, day); // Month is zero-based in JavaScript

    // Filter events to get those that occur on the specified date
    const dayEvents = events.filter(event => {
        // Ensure event.date is a Date object
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
    });

    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden"); // Disable body overflow when modal is open

    // Close button functionality
    const closeBtn = document.getElementById('event-modal-btn')
    closeBtn.onclick = function(event) {
            modal.classList.add('hidden');
            document.body.classList.remove("overflow-hidden");
        
    }

    // Close modal on outside click
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
            document.body.classList.remove("overflow-hidden");
        }
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            modal.classList.add('hidden');
                document.body.classList.remove("overflow-hidden");
        }
    });

    modalContent.innerHTML = ""; // Clear previous content
    modalTitle.innerText = `Events on ${date.toLocaleDateString()}`; // Reset modal title

    if (dayEvents.length > 0) {
        dayEvents.forEach((event, index) => {
            modalContent.innerHTML += eventCard(event, index);
        });
    } else {
        modalContent.innerHTML += '<div class="rounded-xl text-gray-500 text-center p-4 bg-gray-100">No events on this date.</div>';
    }
}
// function eventCard(event, index) {
//     const colorClasses = {
//         bg: `bg-${event.color}-100`,
//         border: `border-${event.color}-200`,
//         text: `text-${event.color}-800`,
//         hover: `hover:bg-${event.color}-200`,
//     };

//     const formatDate = (date) => {
//         return new Date(date).toLocaleDateString('en-US', {
//             weekday: 'short',
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const formatTime = (time) => {
//         const [hours, minutes] = time.split(':');
//         const intHours = parseInt(hours, 10);
//         const period = intHours >= 12 ? 'PM' : 'AM';
//         const adjustedHours = intHours % 12 || 12; // Convert 0 (midnight) and 12 (noon) correctly
//         return `${adjustedHours}:${minutes} ${period}`;
//     };

//     const truncateText = (text, maxLength) => {
//         return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
//     };

//     const isPastEvent = new Date(event.date) < new Date();

//     return `
//         <div 
//             class="group border fade-in rounded-lg overflow-hidden transition-all duration-300 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text} ${colorClasses.hover}"
//             style="animation-delay: ${index * 50}ms"
//         >
//             <div class="p-4 space-y-3">
//                 <div class="flex justify-between items-start">
//                     <div>
//                         <h3 class="font-semibold text-lg">
//                             ${truncateText(event.title, 20)}
//                         </h3>
//                         <p class="text-sm opacity-75 text-black">
//                             ${formatDate(event.date)}
//                             <span class="mx-1">•</span>
//                             ${formatTime(event.startTime)} - ${formatTime(event.endTime)}
//                         </p>
//                         ${isPastEvent ? '<span class="text-red-600 text-xs font-semibold">Past Event</span>' : ''}
//                     </div>
//                     <span class="text-xs font-medium uppercase tracking-wide bg-white bg-opacity-50 border ${colorClasses.border} rounded-full px-2 py-1">
//                         ${event.type}
//                     </span>
//                 </div>
//                 <p class="text-sm leading-relaxed text-black">
//                     ${truncateText(event.description, 100)}
//                 </p>
//             </div>
//             <div class="px-4 py-3 bg-white bg-opacity-50 text-sm font-medium flex justify-between items-center">
//                 <button 
//                     onclick="likeEvent('${event.id}')"
//                     class="flex items-center text-${event.color}-600 items-center transition-colors duration-200"
//                     id="likeBtn-${event.id}"
//                 >
//                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
//                         <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
//                     </svg>
//                 </button>
//             </div>
//         </div>
//     `;
// }

function eventCard(event, index) {
    const colorClasses = {
        bg: `bg-${event.color}-100`,
        border: `border-${event.color}-200`,
        text: `text-${event.color}-800`,
        hover: `hover:bg-${event.color}-200`,
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        const [hour, minute] = time.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const isPastEvent = new Date(event.date) < new Date();
    return `
        <div class="group border rounded-lg transition-all duration-300 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text} ${colorClasses.hover} fade-in"
            style="animation-delay: ${index * 50}ms"
        >
            <div class="p-4 space-y-3">
                <!-- Event Header -->
                <div class="flex flex-col space-y-1">
                    <h3 class="font-semibold text-xl">${event.title}</h3>
                    <div class="flex justify-between">
                        <span class="text-xs font-medium uppercase tracking-wide bg-white bg-opacity-50 border border-gray-200 rounded px-2 py-1">
                        ${event.type}
                        </span>
                    </div>
                </div>

                <!-- Event Description -->
                <div class="w-full">
                <p class="text-sm text-black line-clamp-3">
                    ${event.description}
                </p>
                </div>

                <!-- Event Details -->
                <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                <!-- Date -->
                <p class="flex items-center gap-2 text-sm opacity-75 text-black">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>${formatDate(event.date)}</span>
                </p>
                <!-- Time -->
                <p class="flex items-center gap-2 text-sm opacity-75 text-black">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span> ${formatTime(event.startTime)} - ${formatTime(event.endTime)}</span>
                </p>
                <!-- Venue -->
                <p class="flex items-center gap-2 text-sm opacity-75 text-black">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>${event.venue}</span>
                </p>
                </div>

                <!-- Event Actions -->
                <div class="text-sm font-medium flex justify-between items-center">
                    <button 
                        onclick="likeEvent('${event.id}')"
                        class="flex items-center text-${event.color}-600 items-center transition-colors duration-200"
                        id="likeBtn-${event.id}"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}
function likeEvent(eventId) {
    // Fetch and parse events from localStorage
    const events = JSON.parse(localStorage.getItem('events')) || [];

    // Find the event by ID
    const event = events.find(e => String(e.id) === String(eventId));

    // If the event is found, check for 'likes' property and update
    if (event) {
        // Check if 'likes' property exists; if not, initialize it
        if (typeof event.likes === 'undefined') {
            event.likes = 1; // Initialize likes if it doesn't exist
        } else {
            event.likes += 1; // Increment likes
        }

        console.log(`Updated likes for event ${eventId}: ${event.likes}`);

        // Update all buttons with the same event ID
        const likeBtns = document.querySelectorAll(`#likeBtn-${eventId}`);
        
        likeBtns.forEach(likeBtn => {
            likeBtn.disabled = true;
            likeBtn.classList.add('cursor-not-allowed');
            // Change the heart icon to filled
            const heartIcon = likeBtn.querySelector('svg');
            if (heartIcon) {
                heartIcon.setAttribute('fill', 'currentColor');
            }
            likeBtn.innerHTML += "Interested";
        });

        // Save the updated events array back to localStorage
        localStorage.setItem('events', JSON.stringify(events));
    } else {
        console.error(`Event with ID ${eventId} not found.`);
    }
}
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCurrentMonthYear();
    loadCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCurrentMonthYear();
    loadCalendar();
});
// Initialize the calendar
updateCurrentMonthYear();
loadCalendar();