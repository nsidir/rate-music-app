<template>
    <div class="top-bar">
      <div class="logo">RYT</div>
      <nav class="nav-links"> <!-- Need to add links -->
        <a href="#">new music</a>
        <a href="#">genres</a>
        <a href="#">charts</a>
        <a href="#">lists</a>
      </nav>
      <div class="search-profile">
        <input type="text" placeholder="Search..." class="search-bar" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TopBar',
  };
  </script>
  
  <style scoped>
  /* Basic reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Top bar styling */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    padding: 10px 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  /* Logo styling */
  .logo {
    font-size: 1.5em;
    font-weight: bold;
    color: #000;
  }
  
  /* Navigation links styling */
  .nav-links a {
    margin: 0 10px;
    text-decoration: none;
    color: #0073e6;
    font-size: 1em;
  }
  
  .nav-links a:hover {
    color: #005bb5;
  }
  
  /* Search bar and profile icon container */
  .search-profile {
    display: flex;
    align-items: center;
  }
  
  /* Search bar styling */
  .search-bar {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-right: 10px;
  }
  
  /* Profile icon styling */
  .profile-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
  }
  </style>
  