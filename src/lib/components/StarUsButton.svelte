<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Icon from "@iconify/svelte";

    import { onDestroy, onMount } from 'svelte';
    import { browser } from '$app/environment'

    let stars = 0;
    let showButton = true;

    onMount(async () => {
        try {
            const response = await fetch(`https://api.github.com/repos/cratebytes/cratebytes`);
            if (response.ok) {
                const data = await response.json();
                stars = data.stargazers_count;
            } else {
                console.error('Failed to fetch stargazer count:', response.status);
            }
        } catch (error) {
            console.error('Error fetching stargazer count:', error);
        }

        const handleScroll = () => {
            if (document.body.scrollTop > 50) {
                showButton = false;
            } else {
                showButton = true;
            }
        }

        document.body.addEventListener('scroll', handleScroll);
    });

</script>

<Button class="absolute bottom-4 font-semibold rounded-lg shadow-lg flex items-center transition-all duration-200 ease-in-out {showButton ? "space-x-2 py-2 px-4 left-1/2 transform -translate-x-1/2" : "p-3 left-4"}" href="https://github.com/cratebytes/cratebytes" target="_blank">
    <Icon icon="mdi:github" class="w-5 h-5" />

    {#if showButton}
    <span>Star us on GitHub</span>
    
    <span class="ml-2 bg-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
        { stars }
    </span>
    {/if}
</Button>