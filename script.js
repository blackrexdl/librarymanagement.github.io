// Theme toggle
const themeToggleBtn = document.getElementById('themeToggle');
themeToggleBtn.addEventListener('click', toggleTheme);

function toggleTheme(){
    if(document.body.style.background === '' || document.body.style.background === 'rgb(18, 18, 18)'){
        document.body.style.background = '#f0f0f0';
        document.body.style.color = '#121212';
        document.querySelectorAll('.card,.stat-card,table,th,td').forEach(el => el.style.background = '#fff');
    } else {
        document.body.style.background = 'var(--bg-dark)';
        document.body.style.color = 'var(--text)';
        document.querySelectorAll('.card,.stat-card,table,th,td').forEach(el => el.style.background = 'var(--bg-card)');
    }
}

// Local Storage
let books = JSON.parse(localStorage.getItem('books')) || [];

// Charts setup
const ctxTotal = document.getElementById('chartTotal').getContext('2d');
const chartTotal = new Chart(ctxTotal, {type:'bar', data:{labels:['Books'], datasets:[{label:'Total',data:[0], backgroundColor:'#5f9ea0'}]}, options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}});
const ctxBorrowed = document.getElementById('chartBorrowed').getContext('2d');
const chartBorrowed = new Chart(ctxBorrowed, {type:'bar', data:{labels:['Borrowed'], datasets:[{label:'Borrowed',data:[0], backgroundColor:'#f44336'}]}, options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}});
const ctxAvailable = document.getElementById('chartAvailable').getContext('2d');
const chartAvailable = new Chart(ctxAvailable, {type:'bar', data:{labels:['Available'], datasets:[{label:'Available',data:[0], backgroundColor:'#8bc34a'}]}, options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}});

// Safe Animate Number Function
function animateNumber(id, target){
    const elem = document.getElementById(id);
    let current = parseInt(elem.innerText) || 0;
    if(current === target) return; // prevent infinite loop
    const step = target > current ? 1 : -1;
    const interval = setInterval(() => {
        current += step;
        elem.innerText = current;
        if(current === target) clearInterval(interval);
    }, 15);
}

function updateStats(){
    const total = books.length || 0;
    const borrowed = books.filter(b => b.status === 'Borrowed').length || 0;
    const available = total - borrowed;

    // Animate numbers
    animateNumber('totalBooks', total);
    animateNumber('borrowedBooks', borrowed);
    animateNumber('availableBooks', available);

    // Update charts with smooth animation
    chartTotal.data.datasets[0].data = [total];
    chartTotal.update();
    
    chartBorrowed.data.datasets[0].data = [borrowed];
    chartBorrowed.update();
    
    chartAvailable.data.datasets[0].data = [available];
    chartAvailable.update();
}

// Add Book
function addBook(){
    const name = document.getElementById('bookName').value.trim();
    const author = document.getElementById('authorName').value.trim();
    if(name && author){
        books.push({name, author, status:'Available'});
        document.getElementById('bookName').value = '';
        document.getElementById('authorName').value = '';
        saveUpdate();
        showMessage(`"${name}" added!`);
    } else {
        showMessage("Enter valid book and author!");
    }
}

// Edit Book
function editBook(index){
    const newName = prompt("New name:", books[index].name);
    const newAuthor = prompt("New author:", books[index].author);
    if(newName && newAuthor){
        books[index].name = newName;
        books[index].author = newAuthor;
        saveUpdate();
        showMessage("Book updated!");
    }
}

// Borrow
function borrowBook(index){
    if(books[index].status === 'Available'){
        books[index].status = 'Borrowed';
        saveUpdate();  // instant save & update
        showMessage(`"${books[index].name}" borrowed!`);
    } else showMessage(`"${books[index].name}" already borrowed!`);
}

// Return
function returnBook(index){
    books[index].status = 'Available';
    saveUpdate(); // instant save & update
    showMessage(`"${books[index].name}" returned!`);
}

// Edit
function editBook(index){
    const newName = prompt("New name:", books[index].name);
    const newAuthor = prompt("New author:", books[index].author);
    if(newName && newAuthor){
        books[index].name = newName;
        books[index].author = newAuthor;
        saveUpdate(); // instant save & update
        showMessage("Book updated!");
    }
}

// Delete
function deleteBook(index){
    books.splice(index,1);
    saveUpdate(); // instant save & update
    showMessage("Book deleted!");
}

// Save & Update instantly
function saveUpdate(){
    // Save current books to localStorage immediately
    localStorage.setItem('books', JSON.stringify(books));
    
    // Update table and stats instantly
    updateTable();
    updateStats();
}

// Update Table
function updateTable(){
    const tbody = document.querySelector('#bookTable tbody');
    tbody.innerHTML = '';
    books.forEach((book,index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td><input type="checkbox" class="selectBook" data-index="${index}"></td>
        <td>${book.name}</td>
        <td>${book.author}</td>
        <td class="status-${book.status}">${book.status}</td>
        <td>
        ${book.status==='Available'? `<button class="edit-btn" onclick="editBook(${index})">Edit</button>` : ''}
        ${book.status==='Available'? `<button class="borrow-btn" onclick="borrowBook(${index})">Borrow</button>` : `<button class="return-btn" onclick="returnBook(${index})">Return</button>`}
        <button class="delete-btn" onclick="deleteBook(${index})">Delete</button>
        </td>`;
        tbody.appendChild(tr);
        tr.style.opacity=0; 
        setTimeout(()=>{tr.style.transition='opacity 0.5s'; tr.style.opacity=1;},50);
    });
}

// Filter Table
function filterTable(){
    const filter = document.getElementById('searchBox').value.toLowerCase();
    document.querySelectorAll('#bookTable tbody tr').forEach(row=>{
        const name=row.cells[1].innerText.toLowerCase();
        const author=row.cells[2].innerText.toLowerCase();
        row.style.display=(name.includes(filter)||author.includes(filter))?'':'none';
    });
}

// Message Notification
function showMessage(msg){
    const box=document.createElement('div');
    box.innerText=msg;
    box.style.position='fixed';box.style.bottom='20px';box.style.right='20px';
    box.style.background='#5f9ea0';box.style.color='#fff';box.style.padding='12px 20px';
    box.style.borderRadius='8px';box.style.boxShadow='0 5px 15px rgba(0,0,0,0.5)';
    box.style.opacity=0; box.style.transition='opacity 0.5s';
    document.body.appendChild(box); setTimeout(()=>box.style.opacity=1,50);
    setTimeout(()=>{box.style.opacity=0; setTimeout(()=>box.remove(),500);},2000);
}

// Batch Borrow/Delete
function batchBorrow(){
    document.querySelectorAll('.selectBook:checked').forEach(cb=>{
        const index = parseInt(cb.dataset.index);
        if(books[index].status === 'Available') books[index].status='Borrowed';
    });
    saveUpdate(); showMessage("Batch borrow complete!");
}
function batchDelete(){
    const checked = [...document.querySelectorAll('.selectBook:checked')].map(cb=>parseInt(cb.dataset.index)).sort((a,b)=>b-a);
    checked.forEach(i=>books.splice(i,1));
    saveUpdate(); showMessage("Batch delete complete!");
}

// CSV Export/Import
function exportCSV(){
    let csv="Book Name,Author,Status\n";
    books.forEach(b=>{csv+=`${b.name},${b.author},${b.status}\n`;});
    const blob=new Blob([csv],{type:'text/csv'});
    const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download="books.csv"; link.click();
}
function importCSV(){
    const file=document.getElementById('importFile').files[0];
    if(file){
        const reader=new FileReader(); 
        reader.onload=e=>{
            const lines=e.target.result.split('\n');
            lines.forEach((line,i)=>{
                if(i===0) return;
                const [name,author,status] = line.split(',');
                if(name && author) books.push({name, author, status: status ? status.trim() : 'Available'});
            });
            saveUpdate(); showMessage("CSV Imported!");
        };
        reader.readAsText(file);
    }
}

// Initialize
updateTable();
updateStats();