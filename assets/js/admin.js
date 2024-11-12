
function fetchEventData(){
    const storedEvents = localStorage.getItem('events');
    const events = storedEvents ? JSON.parse(storedEvents) : []; 
    return events;
}
let currentDate = new Date();

let activeTab = 'thisMonth';
function openDeleteEventModal(eventId){
    const deleteEventModal = document.getElementById('delete-event-modal')
    if(deleteEventModal){
        deleteEventModal.classList.remove('hidden');
        document.body.classList.add("overflow-hidden"); 
    }
    document.getElementById('confirmDeleteButton').addEventListener('click', function() {
        if (eventId) {
            const events = JSON.parse(localStorage.getItem('events')) || [];
            const updatedEvents = events.filter(event => String(event.id) !== String(eventId));
            localStorage.setItem('events', JSON.stringify(updatedEvents));
            deleteEventModal.classList.add('hidden');
            document.body.classList.remove("overflow-hidden"); 

            const cardEvent = document.querySelectorAll(`#card-event-${eventId}`);
            cardEvent.forEach(element => {
                element.remove();
            });
            showToast("Event Deleted")
            loadCalendar()
            updateMonthEvents()
        }
    });
    document.getElementById('close-delete-event-modal').addEventListener('click', function() {
        deleteEventModal.classList.add('hidden');
        document.body.classList.remove("overflow-hidden"); 
    });
}
function showDayEvents(year, month, day) {
    const events = fetchEventData();

    const date = new Date(year, month, day); 

    const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
    });

    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden"); 

    const closeBtn = document.getElementById('event-modal-btn')
    closeBtn.onclick = function(event) {
            modal.classList.add('hidden');
            document.body.classList.remove("overflow-hidden");
        
    }

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
        modalContent.innerHTML += '<div class="rounded text-gray-500 text-center p-4 bg-gray-100">No events on this date.</div>';
    }

    
    document.getElementById('day-event-btn').innerHTML = `
        <button onclick="openEventModalForm('${date}')" class="w-full h-9 px-2 flex items-center justify-center bg-blue-600 text-white rounded">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add event</span>
        </button>`;
}
function loadCalendar(){
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
        <div id="card-event-${event.id}" class="group border rounded-lg transition-all duration-300 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text} ${colorClasses.hover} fade-in"
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
                <!-- Like Button -->
                <button class="flex items-center transition-colors duration-200" id="likeBtn-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                    </svg>
                    <span class='text-black'>${event.likes === undefined ? "0" : event.likes} Interested</span>
                </button>
                
                <!-- Edit and Delete Buttons -->
                <div class="flex space-x-2 text-gray-800">
                    <button 
                    onclick="openEventModalForm('${event.id}')"
                    class="p-1 rounded-full hover:bg-${event.color}-400 transition-colors duration-200"
                    aria-label="Edit event: Event Title"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    </button>
                    <button 
                    onclick="openDeleteEventModal('${event.id}')"
                    class="p-1 rounded-full hover:bg-${event.color}-400 transition-colors duration-200"
                    aria-label="Remove event: Event Title"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    </button>
                </div>
                </div>
            </div>
        </div>
    `;
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
function showTab(tabName){
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
const updateCurrentMonthYear = () => {
    document.getElementById('currentMonthYear').textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
}
function loadAnalytics(){
    const events = fetchEventData()
    // Calculate analytics based on events data
    const analyticsDiv = document.getElementById('analytics');
    analyticsDiv.innerHTML = ''; // Clear existing content to prevent duplication

    // Calculate analytics based on events data
    const totalEvents = events.length;
    const upcomingEvents = events.filter(event => new Date(event.date) > currentDate).length;
    const completedEvents = events.filter(event => new Date(event.date) < currentDate).length;
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear(); // Ensure currentYear is defined

    const eventsThisMonth = events.filter(event => {
        const eventDate = new Date(event.date); // Convert to Date object if necessary
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    }).length;

    // Prepare analytics data array with SVG paths
    const analyticsData = [
        { title: "Total Events", value: totalEvents, color: "blue" },
        { title: "Completed Events", value: completedEvents, color: "green" },
        { title: "Upcoming Events", value: upcomingEvents, color: "yellow" },
        { title: "This Month", value: eventsThisMonth, color: "purple" }
    ];

    analyticsDiv.innerHTML = analyticsData.map(item => `
        <div class="bg-white rounded-xl border p-4">
            <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-4">
                    <p class="text-3xl font-medium text-gray-800 truncate">${item.value}</p>
                    <div class=" bgs-${item.color}-300" rounded-full p-2 h-6 w-6">
                        <svg class="h-6 w-6 text-${item.color}-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <div class="">
                    <p class="text-sm font-medium text-gray-500 truncate">${item.title}</p>
                </div>
            </div>
        </div>
    `).join('');
};
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
loadCalendar()
loadAnalytics();
updateCurrentMonthYear();

