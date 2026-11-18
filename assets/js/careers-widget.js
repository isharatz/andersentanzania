(() => {
    const mount = document.getElementById('ajira-jobs-widget');
    if (!mount) return;
    const origin = 'https://ajiraai.africa';
    let fallbackStarted = false;

    // Use the public feed if the supplied embed fails (currently it requests 0.0.0.0).
    async function loadFallback() {
        if (fallbackStarted) return;
        fallbackStarted = true;
        observer.disconnect();
        try {
            const response = await fetch(origin + '/api/embed/jobs/2abfae49-4e02-40ad-9da2-c4cc1ba5a7cb');
            if (!response.ok) throw new Error('Jobs unavailable');
            const data = await response.json();
            const card = document.createElement('div');
            const title = document.createElement('h3');
            title.textContent = data.company?.name || 'Open roles';
            card.append(title);
            const jobs = Array.isArray(data.jobs) ? data.jobs : [];
            jobs.forEach(job => {
                const link = document.createElement('a');
                const url = new URL(job.apply_link || '/jobs/' + encodeURIComponent(job.slug || job.id), origin);
                if (!['https:', 'http:'].includes(url.protocol)) return;
                link.href = url.href;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'career-role';
                const name = document.createElement('strong');
                name.textContent = job.job_name || 'View opportunity';
                const details = document.createElement('span');
                details.textContent = [job.location, job.type].filter(Boolean).join(' · ');
                const action = document.createElement('span');
                action.textContent = 'View role & apply →';
                link.append(name, details, action);
                card.append(link);
            });
            if (!jobs.length) {
                const empty = document.createElement('p');
                empty.textContent = 'No open roles right now. Please check back for future opportunities.';
                card.append(empty);
            }
            mount.replaceChildren(card);
        } catch {
            const message = document.createElement('div');
            message.textContent = 'Opportunities are temporarily unavailable. Please try again later.';
            mount.replaceChildren(message);
        }
    }
    const observer = new MutationObserver(() => {
        if (mount.textContent.includes('Unable to load jobs.')) loadFallback();
    });
    observer.observe(mount, { childList: true, subtree: true });
    document.addEventListener('error', event => {
        if (event.target instanceof HTMLScriptElement && event.target.src.startsWith(origin + '/api/embed/widget/')) loadFallback();
    }, true);
})();
