import "../styles/main.scss";
import Sortable from "sortablejs";
let todo_items = [];

document.addEventListener("DOMContentLoaded", () => {

    /* Function to call initially */
    setLocalDarkMode();
    todo_items = setTodoItemsFromLocal();
    updateTodoCount();

    /* Event Listeners */
    document.getElementById("theme_btn").addEventListener("click", handleThemeBtnClick);
    document.getElementById("todo_form").addEventListener("submit", handleSubmitTodoForm);
    document.getElementById("clear_btn").addEventListener("click", handleClearCompleted);
    document.getElementById("filter_all_btn").addEventListener("click", handleAllFilter);
    document.getElementById("filter_active_btn").addEventListener("click", handleActiveFilter);
    document.getElementById("filter_completed_btn").addEventListener("click", handleCompletedFilter);

    const todo_list = document.getElementById("todo_list");
    Sortable.create(todo_list, {
        onUpdate: handleDragSort,
        ghostClass: "ghost"
    });
});

/* Will update the todo_items based on the dom after drag and drop */
const handleDragSort = (event) => {
    let todo_container = event.from;
    let todo_items = todo_container.querySelectorAll(".todo_item");

    let updated_todo_items = [];

    for(let index = 0; index < todo_items.length; index++){
        const todo_item = todo_items[index];
        
        updated_todo_items.push({
            id: parseInt(todo_item.getAttribute("data-id")),
            content: todo_item.querySelector("p").textContent,
            is_done: todo_item.querySelector("input[type='checkbox']").checked
        });
    }

    todo_items = updated_todo_items;
    updateLocalStorage(todo_items); 
}

/* Will show all completed todo item */
const handleAllFilter = (event) => {
    removeAllTodoItems();
    setTodoItems(todo_items);
    toggleActiveFilterState(event.target)
}

/* Will filter all not completed todo item */
const handleActiveFilter = (event) => {
    const filtered_todo_items = todo_items.filter(todo => !todo.is_done);
    removeAllTodoItems();
    setTodoItems(filtered_todo_items);
    toggleActiveFilterState(event.target)
}

/* Will filter all completed todo item */
const handleCompletedFilter = (event) => {
    const filtered_todo_items = todo_items.filter(todo => todo.is_done);
    removeAllTodoItems();
    setTodoItems(filtered_todo_items);
    toggleActiveFilterState(event.target)
}

/* Will remove all active class to filter button and add for the selected one. */
const toggleActiveFilterState = (clicked_btn) => {
    const filter_btns = document.querySelectorAll(".filters > button");

    for(let index = 0; index < filter_btns.length; index++){
        filter_btns[index].classList.remove("active");
    }

    clicked_btn.classList.add("active");
}

/* Will remove all todo items in DOM. */
const removeAllTodoItems = () => {
    const all_todo_items = document.querySelectorAll("#todo_form .todo_item");

    for(let index = 0; index < all_todo_items.length; index++){
        all_todo_items[index].remove();
    }
}

/* Will handle the clearing of done todos. */
const handleClearCompleted = () => {
    const todo_item_elements = document.querySelectorAll("#todo_form .todo_item");
    todo_items = todo_items.filter(item => !item.is_done);
    updateLocalStorage(todo_items);
    updateTodoCount();

    /* Will loop through the todo items and remove if it is marked as done. */
    for (let index = 0; index < todo_item_elements.length; index++){
        const todo_item_element = todo_item_elements[index];

        if(todo_item_element.querySelector("input[type='checkbox']").checked){
            todo_item_element.remove();
        }
    }
}

/* Will handle the submitting of todo form */
const handleSubmitTodoForm = (event) => {
    event.preventDefault();
    const new_todo_input = event.target.querySelector("input[name='new_todo_input']");
    const is_done_input = event.target.querySelector("input#input_checkbox").checked;

    const new_todo_item = {
        id: Math.floor(Math.random() * 999999),
        content: new_todo_input.value,
        is_done: is_done_input
    };

    addTodoItem(new_todo_item, true);
    todo_items.unshift(new_todo_item);
    updateLocalStorage(todo_items);
    updateTodoCount();
    new_todo_input.value = "";
}

/* Will handle the click event for button theme */
const handleThemeBtnClick = (event) => {
    const target_element = event.target;

    if(target_element.getAttribute("class") === "moon_icon"){
        toggleDarkMode(true);
    }
    else{
        toggleDarkMode(false);
    }
}

/* Will handle the click function for "X" icon to delete the selected todo. */
const handleDeleteTodoItem = (event) => {
    const selected_todo_item = event.target.closest(".todo_item");
    todo_items = todo_items.filter(item => item.id != selected_todo_item.getAttribute("data-id"));
    selected_todo_item.remove();
    updateLocalStorage(todo_items);
    updateTodoCount();
}

/* Will handle the toggling of checkbox of todo item. */
const handleUpdateTodoStatus = (event) => {
    const todo_item = event.target.closest(".todo_item");
    const todo_id = todo_item.getAttribute("data-id");

    todo_items = todo_items.map(item => {
        if(item.id === +todo_id){
            return {
                ...item,
                is_done: event.target.checked
            };
        }
        return item;
    });

    updateLocalStorage(todo_items);
}

/* Will handle the toggling of dark or light mode. */
const toggleDarkMode = (set_to_dark = false) => {
    const theme_btn_icon = document.querySelector("#theme_btn span");
    const body = document.querySelector("body");

    if(set_to_dark){
        theme_btn_icon.setAttribute("class", "sun_icon");
        body.classList.add("dark_mode");
        localStorage.setItem("is_dark_mode", true);
    }
    else{
        theme_btn_icon.setAttribute("class", "moon_icon");
        body.classList.remove("dark_mode");
        localStorage.setItem("is_dark_mode", false);
    }
}

/* Will get the value of is_dark_mode from localstorage. */
const setLocalDarkMode = () => {
    const is_dark_mode = localStorage.getItem("is_dark_mode");
    if(JSON.parse(is_dark_mode)){
        toggleDarkMode(true);
    }
    else{
        toggleDarkMode(false);
    }
}

/* Will get the todo items from localstorage */
const setTodoItemsFromLocal = () => {
    const todo_items = localStorage.getItem("todo_items");

    /* If there is existing todo items, it will set the todo_items array. */
    if(todo_items){
        setTodoItems(JSON.parse(todo_items));
        return JSON.parse(todo_items);
    }
    else{
        return setDefaultTodoItems();
    }
}

/* Will loop through todo_items array and add it do the form. */
const setTodoItems = (todo_items = []) => {
    for(let index = 0; index < todo_items.length; index++){
        const todo_item = todo_items[index];
        addTodoItem(todo_item);
    }
}

/* Will handle the adding of todo item into the dom. */
const addTodoItem = ({id, content, is_done}, is_prepend = false) => {
    const todo_list = document.querySelector("#todo_list");
    const cloned_todo_item = document.querySelector("#clone_container .todo_item").cloneNode(true);

    cloned_todo_item.setAttribute("data-id", id);
    cloned_todo_item.querySelector("label p").textContent = content;
    cloned_todo_item.querySelector("label").setAttribute("for", id);
    cloned_todo_item.querySelector("input").setAttribute("id", id);
    cloned_todo_item.querySelector(".delete_btn").addEventListener("click", handleDeleteTodoItem);
    cloned_todo_item.querySelector("input").addEventListener("change", handleUpdateTodoStatus);

    if(is_done){
        cloned_todo_item.querySelector("input").setAttribute("checked", true);
    }
    
    /* Will the the todo item to the first on the list if it is newly added. */
    if(is_prepend){
        todo_list.prepend(cloned_todo_item);
    }
    else{
        todo_list.append(cloned_todo_item);
    }
}

/* Default values of todo items if there is no data on localstorage yet. */
const setDefaultTodoItems = () => {
    const default_items = [
        {
            id: 1,
            content: "Complete online JavaScript course",
            is_done: false
        },
        {
            id: 2,
            content: "Jog around the park 3x",
            is_done: false
        },
        {
            id: 3,
            content: "10 minutes meditation",
            is_done: false
        },
        {
            id: 4,
            content: "Read for 1 hour",
            is_done: false
        },
        {
            id: 5,
            content: "Pick up groceries",
            is_done: false
        },
        {
            id: 6,
            content: "Complete Todo App on Frontend Mentor",
            is_done: false
        }
    ];

    setTodoItems(default_items);
    localStorage.setItem("todo_items", JSON.stringify(default_items));

    return default_items;
}

/* Will update the value of todo_items in localstorage. */
const updateLocalStorage = (todo_items) => {
    localStorage.setItem("todo_items", JSON.stringify(todo_items));
}

/* Will get the length of todo_items and update the count on the form. */
const updateTodoCount = () => {
    document.getElementById("todo_length").textContent = `${todo_items.length} items left`;
}