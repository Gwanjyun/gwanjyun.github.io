// 个人学术信息配置
const profileConfig = {
    // 基本信息
    basicInfo: {
        name: "Junyuan Deng (邓钧元)",
        title: "AIGC与图像处理研究员",
        bio: "专注于人工智能生成内容(AIGC)、文本到图像生成及超分辨率技术研究。曾在顶级学术期刊和会议上发表论文。目前主要研究方向为超分算法、图像编辑、文生图模型后处理",
        profileImage: "https://avatars.githubusercontent.com/u/88522489", // 个人照片占位
        cvLink: "#" // CV下载链接
    },
    
    // 联系方式
    contact: [
        { type: "email", content: "gwanjyun@gmail.com" },
        { type: "office", content: "深圳新一代产业园" },
        { type: "phone", content: "+86 150 1303 8195" },
        { type: "github", content: "https://github.com/gwanjyun" },
    ],
    
    // 研究方向
    researchTopics: [
        {
            title: "超分辨率算法",
            description: "基于文生图大模型训练单步和多步超分辨率模型。"
        },
        {
            title: "图像编辑和风格化",
            description: "基于文生图大模型训练特定编辑任务和风格化。"
        },
        {
            title: "真实图像与退化图像的数据生成",
            description: "研究终端手机在长焦拍摄场景下的退化图像与真实图像配对生成技术。"
        },
        {
            title: "超分辨模型的后处理算法",
            description: "研究超分辨率模型的奖励模型，进一步提升真实感和清晰度。"
        }
    ],
    
    // 发表论文
    publications: [
        {
            title: "Acquire and then Adapt: Squeezing out Text-to-Image Model for Image Restoration",
            authors: "Junyuan Deng, Xinyi Wu, Yongxing Yang, Congchao Zhu, Song Wang and Zhenyao Wu*",
            highlightedAuthors: ["Junyuan Deng"],
            journal: "The IEEE/CVF Conference on Computer Vision and Pattern Recognition 2025 (CVPR 2025，一作)",
            year: 2025,
            doi: "https://arxiv.org/abs/2504.15159",
            abstract: "文生图的生成图像作为高质量训练数据，提出适配DiT模型的轻量化ControlNet。",
            keywords: ["扩散模型", "超分辨", "图像生成", "Text-to-Image", "Flux"],
            image: "https://arxiv.org/html/2504.15159v1/x2.png" // 论文相关图片
        },
        {
            title: "ISAR-NeRF: Neural Radiance Fields for 3-D Imaging of Space Target From Multiview ISAR Images",
            authors: "Junyuan Deng, Pengfei Xie, Lei Zhang* and Yulai Cong",
            highlightedAuthors: ["Junyuan Deng"],
            journal: "IEEE Sensors Journal (二区期刊，一作)",
            year: 2024,
            doi: "https://ieeexplore.ieee.org/document/10423594",
            abstract: "首次提出基于NeRF与雷达图像结合的算法，实现空间目标全视角三维重建技术。",
            keywords: ["三维重建", "NeRF", "雷达图像"],
            image: "https://ieeexplore.ieee.org/ielx7/7361/10487994/10423594/graphical_abstract/jsen-gagraphic-3360981.jpg" // 论文相关图片
        },
    ],
    
    // 项目经历（原科研项目，已移除image属性）
    projectExperiences: [
        {
            title: "云端长焦大王影像—***",
            period: "2024-",
            role: "项目负责人",
            description: "***",
            tags: []
        },
        {
            title: "***图像编辑",
            period: "2024-",
            role: "核心研发",
            description: "***",
            tags: ["大模型", "图像编辑"]
        },
        {
            title: "云端长焦大王影像",
            period: "2024-2025",
            role: "核心研发",
            description: "***",
            tags: ["超分辨率", "云端算法", "大模型"]
        },
    ],
    
    // 工作经历
    experience: [
        {
            position: "媒体算法工程师",
            organization: "荣耀终端股份有限公司",
            period: "2024-至今",
            description: "大王影像算法团队，目前负责下一代云端长焦大王影像算法的预研工作。"
        },
        {
            position: "硕士研究生",
            organization: "中山大学 信息与通信工程",
            period: "2021-2024",
            description: "研究方向为神经隐式三维重建。结合NeRF与雷达成像原理，完成空间目标的全视角三维重建工作。"
        },
        {
            position: "本科",
            organization: "中山大学 电子信息科学与技术",
            period: "2017-2021",
            description: "研究方向为深度强化学习。"
        }
    ]
};
