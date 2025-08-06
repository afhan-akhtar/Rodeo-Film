<template>
  <div>
    <h1 style="color: white; font-size: 3rem; text-align: center; margin-top: 100px;">
      🎬 Rodeo Film
    </h1>
    
    <p style="color: white; text-align: center; margin: 20px;">
      Award-winning film production company
    </p>
    
    <div style="display: flex; justify-content: center; margin: 40px;">
      <button style="background: orange; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
        Get Started
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div v-for="project in projects" :key="project.id" style="background: #333; padding: 20px; border-radius: 10px;">
        <img :src="project.image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px;" />
        <h3 style="color: white; margin: 10px 0;">{{ project.title }}</h3>
        <p style="color: #ccc;">{{ project.client }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const projects = [
  {
    id: 1,
    title: 'Nike Campaign',
    client: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    title: 'Apple Launch',
    client: 'Apple', 
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    title: 'Tesla Film',
    client: 'Tesla',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop'
  }
]
</script> 