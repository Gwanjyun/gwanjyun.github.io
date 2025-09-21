// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图片加载处理
    initImageLoading();
    
    // 加载基本信息
    loadBasicInfo();
    // 加载联系方式
    loadContactInfo();
    // 加载研究方向
    loadResearchTopics();
    // 加载发表论文
    loadPublications();
    // 加载项目经历（原科研项目）
    loadProjectExperiences();
    // 加载工作经历
    loadExperience();
});

// 初始化图片加载处理
function initImageLoading() {
    // 为所有图片添加加载状态处理
    document.addEventListener('img-added', function(e) {
        handleImageLoading(e.detail.img);
    });
}

// 处理图片加载状态
function handleImageLoading(img) {
    // 初始设置为加载中状态
    img.classList.add('loading');
    img.classList.remove('loaded');
    
    // 图片加载完成
    img.onload = function() {
        img.classList.remove('loading');
        img.classList.add('loaded');
    };
    
    // 图片加载失败
    img.onerror = function() {
        img.classList.remove('loading');
        img.classList.add('loaded', 'error');
        // 加载失败时使用默认占位图
        img.src = "https://picsum.photos/400/300?grayscale&blur=2";
    };
    
    // 如果图片已经缓存，手动触发onload
    if (img.complete) {
        img.onload();
    }
}

// 加载基本信息
function loadBasicInfo() {
    const basicInfo = profileConfig.basicInfo;
    document.getElementById('name').textContent = basicInfo.name;
    document.getElementById('title').textContent = basicInfo.title;
    document.getElementById('bio').textContent = basicInfo.bio;
    
    // 处理个人头像
    const profileImg = document.getElementById('profile-image');
    profileImg.src = basicInfo.profileImage;
    // 触发图片加载事件
    document.dispatchEvent(new CustomEvent('img-added', { 
        detail: { img: profileImg } 
    }));
    
    document.getElementById('cv-link').href = basicInfo.cvLink;
}

// 加载联系方式
function loadContactInfo() {
    const contactList = document.getElementById('contact-list');
    const contacts = profileConfig.contact;
    
    contacts.forEach(contact => {
        const li = document.createElement('li');
        li.className = 'flex items-center';
        
        let iconClass = '';
        switch(contact.type) {
            case 'email':
                iconClass = 'fa-envelope-o';
                break;
            case 'phone':
                iconClass = 'fa-phone';
                break;
            case 'office':
                iconClass = 'fa-map-marker';
                break;
            case 'github':
                iconClass = 'fa-github';
                break;
            case 'google-scholar':
                iconClass = 'fa-graduation-cap';
                break;
            default:
                iconClass = 'fa-info-circle';
        }
        
        // 如果是链接类型，使用a标签
        if (['github', 'google-scholar', 'email'].includes(contact.type)) {
            let href = contact.content;
            if (contact.type === 'email') {
                href = `mailto:${contact.content}`;
            }
            
            li.innerHTML = `
                <i class="fa ${iconClass} text-[var(--accent)] mr-3 w-4 text-center"></i>
                <a href="${href}" class="hover:text-[var(--accent)] transition-colors">${contact.content}</a>
            `;
        } else {
            li.innerHTML = `
                <i class="fa ${iconClass} text-[var(--accent)] mr-3 w-4 text-center"></i>
                <span>${contact.content}</span>
            `;
        }
        
        contactList.appendChild(li);
    });
}

// 加载研究方向
function loadResearchTopics() {
    const container = document.getElementById('research-topics');
    const topics = profileConfig.researchTopics;
    
    topics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'bg-[var(--card-bg)] p-5 rounded-sm border border-[var(--border)] hover:shadow-md transition-shadow';
        
        topicCard.innerHTML = `
            <h3 class="text-lg font-medium text-[var(--accent)] mb-2">${topic.title}</h3>
            <p class="text-sm text-[var(--text-light)]">${topic.description}</p>
        `;
        
        container.appendChild(topicCard);
    });
}

// 加载发表论文（图片在左侧）
// 修改script.js中的loadPublications函数，替换作者显示部分
function loadPublications() {
    const container = document.getElementById('publications-list');
    const publications = profileConfig.publications;
    
    publications.forEach(pub => {
        const pubCard = document.createElement('div');
        pubCard.className = 'bg-[var(--card-bg)] p-6 rounded-sm border border-[var(--border)] hover:shadow-md transition-shadow';
        
        // 处理作者名字加粗
        let authorsHtml = pub.authors;
        if (pub.highlightedAuthors && pub.highlightedAuthors.length > 0) {
            // 对每个需要高亮的作者进行处理
            pub.highlightedAuthors.forEach(author => {
                // 使用正则表达式精确匹配作者名并添加高亮样式
                const regex = new RegExp(`\\b${author}\\b`, 'g');
                authorsHtml = authorsHtml.replace(regex, `<span class="highlighted-author">${author}</span>`);
            });
        }
        
        // 关键词标签
        const keywordsHtml = pub.keywords.map(keyword => 
            `<span class="inline-block bg-[var(--bg-sidebar)] text-[var(--text-light)] text-xs px-2 py-1 rounded-sm mr-2 mb-2">${keyword}</span>`
        ).join('');
        
        // 左侧图片，右侧内容的布局
        pubCard.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6">
                <!-- 左侧论文图片 -->
                <div class="md:w-1/6 flex-shrink-0">
                    <div class="rounded-sm overflow-hidden h-full">
                        <img src="${pub.image}" alt="${pub.title}的研究成果展示" class="w-full h-full object-cover">
                    </div>
                </div>
                
                <!-- 右侧论文内容 -->
                <div class="md:w-2/3">
                    <h3 class="text-lg font-medium mb-2 hover:text-[var(--accent)] transition-colors">
                        <a href="${pub.doi}">${pub.title}</a>
                    </h3>
                    <p class="text-sm text-[var(--text-light)] mb-3">${authorsHtml} (${pub.year})</p>
                    <p class="text-sm mb-4"><strong>${pub.journal}</strong></p>
                    <p class="text-sm text-[var(--text-light)] mb-4">${pub.abstract}</p>
                    <div class="flex flex-wrap">
                        ${keywordsHtml}
                        <a href="${pub.doi}" class="text-[var(--accent)] text-sm hover:underline ml-auto">查看详情</a>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(pubCard);
        
        // 为论文图片添加加载处理
        const pubImg = pubCard.querySelector('img');
        if (pubImg) {
            document.dispatchEvent(new CustomEvent('img-added', { 
                detail: { img: pubImg } 
            }));
        }
    });
}

// 加载项目经历（原科研项目，已移除图片）
function loadProjectExperiences() {
    const container = document.getElementById('project-experiences-list');
    const projects = profileConfig.projectExperiences;
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'bg-[var(--card-bg)] p-6 rounded-sm border border-[var(--border)] hover:shadow-md transition-shadow';
        
        // 项目标签
        const tagsHtml = project.tags.map(tag => 
            `<span class="inline-block bg-[var(--bg-sidebar)] text-[var(--text-light)] text-xs px-2 py-0.5 rounded-sm mr-2 mb-2">${tag}</span>`
        ).join('');
        
        projectCard.innerHTML = `
            <h3 class="text-lg font-medium mb-2 text-[var(--accent)]">${project.title}</h3>
            <p class="text-sm text-[var(--text-light)] mb-4">${project.period} | ${project.role}</p>
            <p class="text-sm mb-4">${project.description}</p>
            <div class="flex flex-wrap">
                ${tagsHtml}
            </div>
        `;
        
        container.appendChild(projectCard);
    });
}

// 加载工作经历
function loadExperience() {
    const container = document.getElementById('experience-timeline');
    const experiences = profileConfig.experience;
    
    experiences.forEach((exp, index) => {
        const expItem = document.createElement('div');
        expItem.className = 'relative pl-8 pb-2';
        
        // 时间线样式
        const timelineClass = index === experiences.length - 1 ? 'h-6' : 'h-full';
        
        expItem.innerHTML = `
            <div class="absolute left-0 top-1 w-3 h-3 rounded-full bg-[var(--accent)]"></div>
            <div class="absolute left-1.5 top-4 w-0.5 ${timelineClass} bg-[var(--border)]"></div>
            <h3 class="text-lg font-medium">${exp.position}</h3>
            <p class="text-[var(--accent)] mb-2">${exp.organization} | ${exp.period}</p>
            <p class="text-sm text-[var(--text-light)]">${exp.description}</p>
        `;
        
        container.appendChild(expItem);
    });
}
