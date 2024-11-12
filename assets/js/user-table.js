const userForm = document.getElementById("user-form");
const userTableBody = document.getElementById('userTableBody');

function renderUsersTable() {
    userTableBody.innerHTML = ''; // Clear existing table rows
    const users = JSON.parse(localStorage.getItem('users')) || [];

    users.forEach(user => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50');
        row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap hidden md:table-cell">${user.id}</td>
            <td class="px-4 py-2 whitespace-nowrap">${user.name}</td>
            <td class="px-4 py-2 whitespace-nowrap hidden md:table-cell">${user.email}</td>
            <td class="px-4 py-2 whitespace-nowrap hidden md:table-cell">${user.password}</td>
            <td class="px-4 py-2 whitespace-nowrap flex space-x-2">
                <button class="bg-yellow-500 text-white py-1 px-3 rounded text-xs hover:bg-yellow-700" onclick="editUser(${user.id})">Edit</button>
                <button class="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-700" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

renderUsersTable();

const openUserModalBtn = document.getElementById('open-user-modal-btn');
openUserModalBtn.addEventListener('click', () => openAddUserModal());

const cancelUserModalBtn = document.getElementById('cancelUserBtn');
cancelUserModalBtn.addEventListener('click', closeAddUserModal);

let userID = null;

function openAddUserModal(param = null) {
    document.getElementById('addUserModal').classList.remove('hidden');
    const headerTitle = document.getElementById("user-modal-title");
    const form = document.getElementById("user-form");

    if (param) {
        userID = param;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.id === userID); 

        if (user) {
            headerTitle.innerText = "Edit user";
            document.getElementById("name").value = user.name;
            document.getElementById("email").value = user.email;
            document.getElementById("password").value = user.password;
        } else {
            showToast("User not found.");
        }
    } else {
        headerTitle.innerText = "Add user";
    }
}

function closeAddUserModal() {
    document.body.classList.remove("overflow-hidden");
    userID = null;
    document.getElementById('addUserModal').classList.add('hidden');
    resetUserForm();
}

function resetUserForm() {
    userForm.reset();
    document.getElementById("password").value = "";
}

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

userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(userForm);
    const userData = Object.fromEntries(formData.entries());

    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (userID == null) {
        const emailExists = users.some(user => user.email === userData.email);

        if (emailExists) {
            showToast('Email already exists. Please use a different email address.');
        } else {
            const newUser = {
                ...userData,
                id: getNextUserId(users) 
            };

            users.push(newUser); 
            localStorage.setItem('users', JSON.stringify(users)); 
            showToast('User added successfully!');
            closeAddUserModal();  
            renderUsersTable();  
        }
    } else {
        const updatedUsers = users.map(user => 
            user.id === userID ? { ...user, ...userData } : user
        );

        localStorage.setItem('users', JSON.stringify(updatedUsers)); 
        showToast('User updated successfully!');
        closeAddUserModal(); 
        renderUsersTable();  
        userID = null; 
    }
});

function getNextUserId(users) {
    const maxId = users.reduce((max, user) => user.id > max ? user.id : max, 0);
    return maxId + 1;
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));

        showToast('User deleted successfully.');
        renderUsersTable();
    }
}

function editUser(userId) {
    openAddUserModal(userId);
}
