import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MajorMatch.module.css";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

type Choice = "S" | "D";
type Language = "en" | "zh";

const ZH: Record<string, string> = {
  "News": "最新消息", "The difference": "专业差异", "Three ideas": "三个核心问题", "Courses": "课程设置", "Pathways": "发展方向", "Find your route": "找到适合你的方向",
  "School of Data Science · CUHK Shenzhen": "香港中文大学（深圳）数据科学学院", "Statistics major in the age of data science and AI": "数据科学与人工智能时代的统计学专业", "The Statistics major team, CUHK Shenzhen": "香港中文大学（深圳）统计学专业团队", "Begin": "开始了解",
  "Latest Statistics major news": "统计学专业最新消息", "NEWS": "消息", "FEATURED TALK": "重点讲座", "AUG 31 · MON": "8月31日 · 星期一", "Conference Hall II": "会议厅 II", "SDS Faculty Mini Lecture — Prof. Yao": "数据科学学院教师微课堂 — 姚教授", "Experience the classroom through a short faculty mini lecture.": "通过一节教师微课堂，亲身体验大学课堂。", "Dialogue with a Master — Professor C. F. Jeff Wu": "大师对话 — 吴建福教授", "A special one-hour dialogue with Professor C. F. Jeff Wu.": "与吴建福教授进行一小时特别对话。",
  "STATISTICS IS A WAY OF SEEING": "统计学是一种看世界的方式", "Random one by one.": "单次充满随机，", "Predictable together.": "整体呈现规律。", "Each ball takes an uncertain route. Drop enough of them and a stable pattern appears. Statistics turns noisy": "每颗小球的路径都不确定；当数量足够多时，稳定的规律便会出现。统计学把嘈杂的", "DATA": "数据", "into patterns we can understand — and decisions we can defend.": "转化为可理解的规律，以及经得起检验的决策。", "DROP 1": "投放 1 颗", "DROP 250": "投放 250 颗", "DROP 500": "投放 500 颗", "SEE WHAT STATISTICS DOES ↓": "看看统计学能做什么 ↓",
  "TWO FIELDS, DIFFERENT CENTRES OF GRAVITY": "两个专业，不同的思维重心", "Prediction is powerful. Trust is a separate problem.": "预测很强大；判断它是否可信，是另一回事。", "Data Science asks how to predict, automate, and scale. Statistics asks what the evidence supports, how uncertain we are, and whether an observed relationship is causal.": "数据科学关注如何预测、自动化与规模化；统计学关注证据支持什么、我们有多确定，以及观察到的关系是否具有因果性。", "STATISTICS": "统计学", "DATA SCIENCE": "数据科学", "Inference": "推断", "Causality": "因果", "Uncertainty": "不确定性", "Prediction": "预测", "Automation": "自动化", "Products": "产品", "Reliable conclusions from limited, noisy, or high-stakes evidence.": "从有限、嘈杂或高风险的证据中得到可靠结论。", "Useful systems built from large, complex, and continuously changing data.": "从海量、复杂且持续变化的数据中构建可用系统。",
  "THREE QUESTIONS STATISTICS TRAINS YOU TO ASK": "统计学训练你提出三个问题", "What do inference, causality, and uncertainty actually do?": "推断、因果与不确定性究竟解决什么问题？", "01 · INFERENCE": "01 · 推断", "The Lady Tasting Tea": "女士品茶实验", "Can someone really taste which ingredient entered the cup first — or could a perfect result happen by chance?": "一个人真的能尝出先倒茶还是先倒奶吗？全对也可能只是偶然吗？", "MILK FIRST": "先倒奶", "Tea descends and mixes into milk": "茶落入奶中并混合", "TEA FIRST": "先倒茶", "Milk descends and mixes into tea": "奶落入茶中并混合", "8 / 8 CORRECT": "8 / 8 全部正确", "Skill—or a lucky streak?": "真有能力，还是运气好？", "Inference asks:": "推断要问：", "What is the chance she calls the next cup correctly? And how surprising is 8/8 if she were only guessing?": "她下一杯判断正确的概率是多少？如果只是猜测，8 次全对有多罕见？", "Inspired by R. A. Fisher’s classic eight-cup experiment: the design matters as much as the result.": "源自 R. A. Fisher 的经典八杯实验：实验设计与结果同样重要。",
  "02 · CAUSALITY": "02 · 因果", "The Umbrella Mystery": "雨伞之谜", "On days with more umbrellas, traffic accidents also rise. Did umbrellas cause the accidents?": "雨伞更多的日子，交通事故也更多。是雨伞造成了事故吗？", "Correlation is not causation.": "相关不等于因果。", "Two things can rise together without one causing the other. Here, rain explains both.": "两件事可以同时增加，却并非一方造成另一方；这里，降雨同时解释了二者。", "Causality asks:": "因果推断要问：", "What would happen to accidents if umbrellas themselves changed, while the rain did not?": "如果降雨不变，只改变雨伞本身，事故会发生什么变化？",
  "03 · UNCERTAINTY": "03 · 不确定性", "Same 52%. Same confidence?": "同样是 52%，可信程度一样吗？", "Imagine two baseball analysts estimating that a rookie has a 52% chance of reaching base next time. Their headline number is identical—but their evidence is not.": "两位棒球分析师都估计一名新秀下次上垒的概率是 52%。数字相同，证据却不同。", "A HYPOTHETICAL BASEBALL STORY": "一个假想的棒球故事", "FIRST 10 GAMES": "最初 10 场", "A few unusual games can move the estimate a lot": "少数异常比赛就可能大幅改变估计", "FULL 162-GAME SEASON": "完整 162 场赛季", "More evidence makes the estimate more stable": "更多证据让估计更稳定", "Uncertainty asks:": "不确定性要问：", "Not only “What is our estimate?” but also “How much could it change if we observed more games?” Same estimate; very different confidence.": "不仅要问“我们的估计是多少”，还要问“如果观察更多比赛，它可能改变多少”。估计相同，可信程度却大不相同。",
  "WHY STATISTICS": "为什么选择统计学", "DEPTH THAT REMAINS USEFUL": "不会过时的思维深度", "AI can produce an answer. Statistical training helps you know when it is wrong.": "AI 可以生成答案；统计训练帮助你判断答案何时是错的。", "Depth that lasts": "经得起变化的基础", "Probability, inference, modelling, uncertainty and causal reasoning remain valuable when tools and frameworks change.": "即使工具与框架不断变化，概率、推断、建模、不确定性与因果思维仍然重要。", "Flexible destinations": "多样的发展方向", "Statistics, Biostatistics, Data Science, Operations Research, Finance and evidence-intensive industry roles all remain open.": "统计、生物统计、数据科学、运筹学、金融及重视证据的行业岗位都保持开放。", "Proven outcomes across profiles": "不同背景都有真实去向", "Recent cohorts show viable graduate-study and industry pathways across a wide range of academic profiles.": "近年学生数据显示，不同学业背景都能找到可行的升学与就业路径。", "A natural bridge to DS and AI": "通往数据科学与 AI 的自然桥梁", "A rigorous Statistics foundation makes later machine-learning and data-science skills easier to learn well.": "扎实的统计基础能帮助学生更深入地掌握后续机器学习与数据科学技能。",
  "WHY THESE COURSES?": "为什么要学习这些课程？", "The curriculum is built around one task: learning from evidence.": "课程体系围绕一个核心任务：从证据中学习。", "Statistics turns data into defensible conclusions. That requires a common core for inference, then specialised methods for the structures that different fields produce.": "统计学把数据转化为经得起检验的结论：先建立推断所需的共同核心，再针对不同领域的数据结构学习专门方法。", "COMMON CORE · THE INFERENCE ENGINE": "共同核心 · 统计推断的引擎", "Probability": "概率工具", "Learning from data": "从数据中学习", "Mathematical foundations, randomness, sampling variation and stochastic systems": "以微积分、线性代数、数学分析和最优化为基础，理解随机性、抽样波动与随机系统", "Estimation, uncertainty, testing and decisions": "估计、不确定性、检验与决策", "Computing, statistical learning and reproducible modelling": "统计计算、统计学习与可复现建模", "One shared goal: estimate what matters, quantify uncertainty, test claims and predict what comes next.": "共同目标：估计重要效应、量化不确定性、检验主张，并预测接下来会发生什么。",
  "APPLICATIONS CHANGED. THE QUESTION STAYED.": "应用不断变化，核心问题始终未变。", "New data structures created new branches of Statistics.": "新的数据结构，推动统计学不断生长出新的分支。", "Electives are not a random menu. Each one adapts inference to a recurring kind of evidence.": "选修课并非随意拼接；每门课程都在回答：面对某种常见的数据结构，应当如何建模与推断。", "EARLY 20TH C.": "20世纪早期", "Fields & experiments": "田野与实验", "Designed comparisons, sampling and rank-based methods for noisy measurements.": "通过实验设计、抽样与秩方法处理带有噪声的测量。", "Experimental Design · Nonparametric Statistics · Survey Sampling": "实验设计 · 非参数统计 · 调查抽样", "MID 20TH C.": "20世纪中期", "Industry & reliability": "工业与可靠性", "Time-to-event, quality and multivariate measurements demanded new models.": "时间—事件、质量与多变量测量催生了新的模型。", "Survival Modelling · Multivariate Analysis": "生存数据模型 · 多元统计分析", "LATE 20TH C.": "20世纪后期", "Markets over time": "随时间变化的市场", "Prices, risk and dependent sequences made time and stochastic dynamics central.": "价格、风险与相关序列让时间依赖和随机动态成为核心。", "Time Series · Stochastic Processes · Financial Modelling": "时间序列 · 随机过程 · 金融统计建模", "2000s →": "2000年代 →", "Health & genomes": "健康与基因组", "Clinical outcomes, categories and high-dimensional biological data widened the toolkit.": "临床结局、类别数据与高维生物数据拓展了统计工具箱。", "Categorical Data · Statistical Genetics · Bioinformatics": "范畴数据 · 统计遗传学 · 生物信息学", "NOW": "现在", "AI & complex data": "AI 与复杂数据", "Modern prediction still needs uncertainty, causality, computation and evaluation.": "现代预测仍离不开不确定性、因果、计算与严谨评估。", "Bayesian Statistics · Causal Inference · Machine Learning": "贝叶斯统计 · 因果推断 · 机器学习",
  "2026–27 STUDY SCHEME": "2026–27 培养方案", "Build the common core. Then choose the evidence you want to understand.": "先掌握共同核心，再选择你想理解的证据类型。", "in the major programme: 23 School Package + 18 Required + 30 Elective. Every student takes three courses in one stream for depth; four courses qualify for declaring that stream.": "主修课程共计：23 学分学院课程 + 18 学分必修课 + 30 学分选修课。每位学生须在一个方向修读三门课以满足深度要求；修满四门可申报该专修方向。", "Mathematical Statistics": "数理统计", "Probability theory, stochastic processes, advanced inference and the mathematical foundations beneath them.": "概率论、随机过程、高等统计推断及其数学基础。", "Statistical Methodology": "统计方法", "Linear and generalised models, experiments, Bayesian methods, survival, time series and causality.": "线性与广义线性模型、实验设计、贝叶斯方法、生存分析、时间序列与因果推断。", "Biostatistics & Bioinformatics": "生物统计与生物信息学", "Health outcomes, genomes, categorical and survival data, plus biomedical machine learning.": "健康结局、基因组、范畴与生存数据，以及生物医学机器学习。", "Financial Statistics": "金融统计", "Time-dependent markets, stochastic calculus, risk, derivatives and financial modelling.": "时间依赖的市场、随机微积分、风险、衍生品与金融建模。", "Computing & Machine Learning": "计算与机器学习", "Algorithms, data structures, machine learning, deep learning and a capstone project.": "算法、数据结构、机器学习、深度学习与毕业设计。", "Course titles and requirements follow the Statistics Study Scheme applicable to students admitted in 2026–27 and thereafter, last updated 20 July 2026.": "课程名称与要求依据适用于 2026–27 学年及以后入学学生的统计学培养方案（2026 年 7 月 20 日更新）。",
  "CUHK-SZ STATISTICS MAJOR · RECENT COHORT SIGNALS": "香港中文大学（深圳）统计学专业 · 近年学生数据", "Statistics has supported strong progression into advanced study.": "统计学专业为继续深造提供了扎实路径。", "The pattern is more useful than a GPA lookup table: across three recent cohorts, most recorded students pursued further study, with a meaningful share reaching PhD pathways.": "比简单的 GPA 对照表更重要的是整体趋势：近三届有记录的学生中，多数选择继续深造，也有相当一部分进入博士路径。", "Further study": "继续深造", "share of students with records": "占有记录学生的比例", "PhD destinations / offers": "博士去向 / 录取", "share with at least one PhD pathway": "至少获得一条博士路径的比例", "Cohort record counts: 41 (2024), 32 (2025), and 44 (2026). *2026 figures reflect offers received as of August 2026 and are still updating; they are not necessarily final destinations. Students holding both study and employment offers may appear in both pathway categories.": "各届记录数：2024 届 41 人、2025 届 32 人、2026 届 44 人。*2026 数据统计截至 2026 年 8 月，仍在更新，未必是最终去向；同时持有升学与就业录取的学生可能出现在多个类别中。",
  "WHERE CAN STATISTICS TAKE YOU?": "统计学可以带你走向哪里？", "Specialised paths — without closing the door to data careers.": "走向专业化，同时不关闭数据职业的大门。", "Graduate study": "继续深造", "Statistics, Biostatistics, Data Science, Operations Research, Finance, Public Health and related programmes.": "统计学、生物统计、数据科学、运筹学、金融、公共卫生及相关项目。", "Evidence-intensive work": "重视证据的专业工作", "Clinical trials, experimental design, risk, actuarial work, quantitative research and policy evaluation.": "临床试验、实验设计、风险与精算、量化研究和政策评估。", "Modern data roles": "现代数据岗位", "Inference-focused data science, experimentation, product analytics, research engineering and AI evaluation.": "重视推断的数据科学、实验平台、产品分析、研究工程与 AI 评估。", "RECENT COHORTS · POOLED": "近年学生 · 合并观察", "Pathways across academic profiles": "不同学业背景的发展路径", "THE BIG PICTURE": "整体图景", "One foundation, many directions": "同一基础，多种方向", "Across the profile layers, Statistics students move into doctoral study, specialised Master’s programmes and modern data work.": "不同学业背景的统计学学生，都能够走向博士、专业硕士以及现代数据工作。", "Doctoral": "博士", "Master’s": "硕士", "Industry": "行业", "Individual outcomes vary, and a major is a foundation — not an admissions or employment guarantee.": "个人结果各不相同；专业是发展的基础，而非升学或就业保证。",
  "FOR FINAL-YEAR STUDENTS · BUILT BY THE CLASS OF 2026": "面向毕业班同学 · 由 2026 届学生共建", "The numbers tell you where. Their stories tell you how.": "数字告诉你他们去了哪里，故事告诉你他们如何抵达。", "Your next application does not have to start from zero.": "你的下一份申请，不必从零开始。", "The CUHK-Shenzhen Graduate Handbook collects first-hand stories from recent graduates about postgraduate applications, internships, careers, exchange programmes and the decisions behind them.": "港中深飞跃手册汇集近期毕业生关于升学申请、实习求职、海外交流及其背后选择的一手经验。", "Applications are hard. Borrow a map from someone who has just finished the journey.": "申请并不容易；不妨借用一张刚走完这段路的人留下的地图。", "EXPLORE THE GRADUATE HANDBOOK": "阅读港中深飞跃手册", "Have a story to share? Contribute to the handbook": "愿意分享你的故事？为飞跃手册投稿", "An independent, student-led project by CUHK-Shenzhen graduates.": "由港中深毕业生自主发起和维护的学生项目。", "GRAD SCHOOL": "升学", "INTERNSHIP": "实习", "CAREER": "职业",
  "MAKE THE CHOICE ACCURATELY": "更准确地做出选择", "If proofs, causality and uncertainty make you curious, Statistics is not a fallback. It may be your route.": "如果证明、因果与不确定性让你感到好奇，统计学并不是退而求其次——它可能正是适合你的方向。", "Compare the required courses. Try one derivation and one small coding project. Then ask which kind of difficulty still feels worth solving.": "比较必修课程，尝试一次数学推导和一个小型编程项目，再问问自己：哪一种困难仍然值得投入？",
  "Do you want to build the answer — or decide whether it deserves trust?": "你更想构建答案，还是判断答案是否值得相信？", "Eight choices. Two ways of thinking with data. No better major in the abstract — only a clearer match for the questions you want to spend years solving.": "八次选择，两种用数据思考的方式。没有抽象意义上更好的专业，只有与你愿意长期解决的问题更匹配的方向。", "A reflection tool, not a psychological assessment.": "这是帮助思考的工具，并非心理测评。", "Route introduction": "方向测试介绍", "Change previous answer": "修改上一题", "YOUR ROUTE NOTE": "你的方向建议", "Take it again": "重新测试", "Review the field comparison ↑": "回看专业比较 ↑", "Statisticians build products too — this website was made by the Statistics major team.": "统计学家也会做产品——这个网站由统计学专业团队制作。", "School of Data Science · Why Statistics": "数据科学学院 · 为什么选择统计学"
};

const NEWS = [
  {
    dateTime: "2026-08-31T13:30:00+08:00",
    date: "AUG 31 · MON",
    time: "13:30–15:50",
    title: "SDS Faculty Mini Lecture — Prof. Yao",
    copy: "Experience the classroom through a short faculty mini lecture.",
    venue: "Conference Hall II",
  },
  {
    dateTime: "2026-08-31T16:00:00+08:00",
    date: "AUG 31 · MON",
    time: "16:00–17:00",
    title: "Dialogue with a Master — Professor C. F. Jeff Wu",
    copy: "A special one-hour dialogue with Professor C. F. Jeff Wu.",
    venue: "Conference Hall II",
  },
] as const;

const ROUNDS: Array<{
  chapter: string;
  question: string;
  stat: { title: string; copy: string };
  ds: { title: string; copy: string };
  insight: string;
}> = [
  {
    chapter: "THE CORE QUESTION",
    question: "Which question sounds more like the work you want to do?",
    stat: { title: "What can we confidently say from this sample — and how sure are we?", copy: "Infer properties of a wider population while making uncertainty explicit." },
    ds: { title: "How accurately can we predict the next outcome — and deploy it at scale?", copy: "Build a function that performs well on future data and can be used repeatedly." },
    insight: "The source discussion frames Statistics around inference and Data Science around prediction and utility.",
  },
  {
    chapter: "THE INTELLECTUAL PULL",
    question: "Which kind of thinking would you rather practise for several years?",
    stat: { title: "Derive models from first principles", copy: "Use probability, mathematical statistics, assumptions, proofs, and interpretable reasoning." },
    ds: { title: "Build scalable systems from working components", copy: "Use programming, algorithms, machine learning, data engineering, and rapid iteration." },
    insight: "This is a difference in curricular centre of gravity — not an absolute boundary.",
  },
  {
    chapter: "THE STANDARD OF SUCCESS",
    question: "Which result would you regard as the more satisfying success?",
    stat: { title: "A transparent claim with quantified uncertainty", copy: "The assumptions are visible; the effect is interpretable; the conclusion can be defended." },
    ds: { title: "A model with strong out-of-sample performance", copy: "It predicts accurately, processes real data, and improves a practical decision or product." },
    insight: "Statistics often measures validity of a conclusion; Data Science often measures predictive utility.",
  },
  {
    chapter: "THE DEFINING COURSES",
    question: "Which difficult course list still sounds worth taking?",
    stat: { title: "Probability, Mathematical Statistics, Experimental Design", copy: "Possibly advanced calculus, real analysis, stochastic processes, Bayesian methods, and causal inference." },
    ds: { title: "Data Structures, Algorithms, Machine Learning, Systems", copy: "Possibly databases, distributed computing, deep learning, data engineering, and MLOps." },
    insight: "Fit often appears in the frustration you are willing to stay with.",
  },
  {
    chapter: "THE DATA REGIME",
    question: "Which data problem would you rather be responsible for?",
    stat: { title: "Extract reliable information from limited, noisy evidence", copy: "A clinical study, designed experiment, risk estimate, or scientific sample." },
    ds: { title: "Extract useful signals from massive, complex data", copy: "A platform, recommendation system, sensor stream, or continuously updated product." },
    insight: "Statistics grew around learning carefully from scarcity; Data Science around acting at scale.",
  },
  {
    chapter: "THE DELIVERABLE",
    question: "Which capstone deliverable would you be more excited to present?",
    stat: { title: "A research paper or clinical-trial analysis", copy: "A rigorous argument about evidence, effects, uncertainty, and what may be concluded." },
    ds: { title: "A deployed AI model or real-time application", copy: "A working system that ingests data, predicts, serves users, and can be monitored." },
    insight: "These examples are adapted from the deliverables contrasted in the source discussion.",
  },
  {
    chapter: "THE WORKING CULTURE",
    question: "Which professional environment feels more like your habitat?",
    stat: { title: "Statistics departments and research labs", copy: "Health, experiments, finance, risk, policy, or methodological research where validity is central." },
    ds: { title: "Computer-science departments and product teams", copy: "AI applications, data platforms, product analytics, or intelligent systems where scale is central." },
    insight: "The borders overlap, but the surrounding work culture often feels different.",
  },
  {
    chapter: "THE AI ERA",
    question: "As AI automates more routine work, where do you want your value to sit?",
    stat: { title: "Experimental design, causal reasoning, and rigorous evaluation", copy: "Audit uncertainty, bias, causal claims, and the consequences of being wrong." },
    ds: { title: "System design, integration, scale, and AI products", copy: "Build, evaluate, deploy, monitor, and improve continuously operating AI capabilities." },
    insight: "AI raises the value of both judgment and engineering — in different ways.",
  },
];

const ROUNDS_ZH: typeof ROUNDS = [
  { chapter: "核心问题", question: "哪一个问题更像是你希望从事的工作？", stat: { title: "从这份样本中，我们可以有多大把握地得到什么结论？", copy: "从样本推断更大群体的性质，并明确表达不确定性。" }, ds: { title: "我们能多准确地预测下一个结果，并把它大规模应用？", copy: "构建能在未来数据上表现良好、可以反复使用的预测函数。" }, insight: "统计学的重心是推断，数据科学的重心更多是预测与效用。" },
  { chapter: "思维吸引力", question: "哪一种思考方式更值得你练习数年？", stat: { title: "从第一原理推导模型", copy: "使用概率、数理统计、假设、证明和可解释的推理。" }, ds: { title: "用成熟组件构建可扩展系统", copy: "使用编程、算法、机器学习、数据工程和快速迭代。" }, insight: "这反映的是课程重心不同，并不是两个领域之间存在绝对边界。" },
  { chapter: "成功标准", question: "哪一种结果更让你有成就感？", stat: { title: "一项透明且量化不确定性的结论", copy: "假设清楚、效应可解释，结论经得起检验。" }, ds: { title: "一个样本外表现优秀的模型", copy: "预测准确，能够处理真实数据，并改善决策或产品。" }, insight: "统计学常衡量结论是否有效；数据科学常衡量预测是否有用。" },
  { chapter: "代表性课程", question: "哪一份有难度的课程清单仍然值得学习？", stat: { title: "概率论、数理统计、实验设计", copy: "还可能包括高等微积分、实分析、随机过程、贝叶斯方法与因果推断。" }, ds: { title: "数据结构、算法、机器学习、系统", copy: "还可能包括数据库、分布式计算、深度学习、数据工程与 MLOps。" }, insight: "真正的适合，往往体现在你愿意坚持面对哪一种困难。" },
  { chapter: "数据环境", question: "你更愿意为哪一种数据问题负责？", stat: { title: "从有限而嘈杂的证据中提取可靠信息", copy: "例如临床研究、设计实验、风险估计或科学样本。" }, ds: { title: "从海量复杂数据中提取有用信号", copy: "例如平台、推荐系统、传感器数据流或持续更新的产品。" }, insight: "统计学擅长从稀缺证据中谨慎学习；数据科学擅长在规模化环境中采取行动。" },
  { chapter: "最终成果", question: "哪一种毕业项目更让你期待？", stat: { title: "一篇研究论文或临床试验分析", copy: "严谨论证证据、效应、不确定性及允许得出的结论。" }, ds: { title: "一个部署上线的 AI 模型或实时应用", copy: "能够接收数据、预测、服务用户并持续监控的工作系统。" }, insight: "两种成果都重要，但它们强调的能力不同。" },
  { chapter: "工作文化", question: "哪一种专业环境更像你的理想工作场所？", stat: { title: "统计系与研究实验室", copy: "健康、实验、金融、风险、政策或方法研究，结论的有效性居于核心。" }, ds: { title: "计算机系与产品团队", copy: "AI 应用、数据平台、产品分析或智能系统，规模化居于核心。" }, insight: "领域边界会重叠，但周围的工作文化往往确有不同。" },
  { chapter: "AI 时代", question: "当 AI 自动化更多常规工作时，你希望自己的价值体现在哪里？", stat: { title: "实验设计、因果推理与严谨评估", copy: "审核不确定性、偏差、因果主张及犯错的后果。" }, ds: { title: "系统设计、集成、规模化与 AI 产品", copy: "构建、评估、部署、监控并持续改进 AI 能力。" }, insight: "AI 同时提升了判断力与工程能力的价值，只是方式不同。" },
];

function resultFor(score: number) {
  if (score >= 7) return { label: "The Statistical Investigator", eyebrow: "STRONGLY STATISTICS-LEANING", copy: "You are drawn to evidence, mechanism, uncertainty, and conclusions that can withstand scrutiny.", fit: "Statistics deserves a serious look — especially biostatistics, causal inference, risk, quantitative research, and research-oriented data science." };
  if (score >= 5) return { label: "The Rigorous Explorer", eyebrow: "STATISTICS-LEANING HYBRID", copy: "You want to understand why a method works, while keeping one foot in practical data work.", fit: "A Statistics foundation combined with computing, machine learning, or domain electives could be an unusually strong fit." };
  if (score === 4) return { label: "The Bridge Builder", eyebrow: "BALANCED PROFILE", copy: "You care about both trustworthy conclusions and useful systems. Your curriculum choices may matter more than the label alone.", fit: "Compare the required courses closely. Statistics plus DS/CS electives — or DS plus deeper inference courses — can both build this profile." };
  if (score >= 2) return { label: "The Applied Modeler", eyebrow: "DATA-SCIENCE-LEANING HYBRID", copy: "You enjoy building and prediction, but you still notice questions of evidence and interpretation.", fit: "Data Science may feel natural; deeper Statistics training can distinguish you in experimentation, evaluation, and high-stakes AI." };
  return { label: "The Systems Builder", eyebrow: "STRONGLY DATA-SCIENCE-LEANING", copy: "You are energized by implementation, scale, iteration, and turning models into working systems.", fit: "Data Science is likely the clearer fit. Keep Statistics in your toolkit: uncertainty and experimental thinking make systems safer and smarter." };
}

function resultForZh(score: number) {
  if (score >= 7) return { label: "统计调查者", eyebrow: "明显偏向统计学", copy: "你被证据、机制、不确定性和经得起检验的结论所吸引。", fit: "值得认真考虑统计学，尤其是生物统计、因果推断、风险、量化研究及研究型数据科学。" };
  if (score >= 5) return { label: "严谨探索者", eyebrow: "偏统计的复合型", copy: "你希望理解方法为什么有效，同时也重视实际数据应用。", fit: "统计学基础结合计算、机器学习或领域选修，可能非常适合你。" };
  if (score === 4) return { label: "跨界连接者", eyebrow: "均衡型", copy: "你同时关心结论是否可信与系统是否有用；课程选择可能比专业名称更重要。", fit: "仔细比较必修课。统计学加数据科学/计算机选修，或数据科学加深度推断课程，都能形成这样的能力组合。" };
  if (score >= 2) return { label: "应用建模者", eyebrow: "偏数据科学的复合型", copy: "你喜欢构建与预测，但也会留意证据和解释问题。", fit: "数据科学可能更自然；更深入的统计训练会让你在实验、评估和高风险 AI 中更有辨识度。" };
  return { label: "系统构建者", eyebrow: "明显偏向数据科学", copy: "实现、规模化、迭代以及把模型变成可用系统让你充满动力。", fit: "数据科学可能更适合你；同时保留统计工具，因为不确定性和实验思维能让系统更安全、更聪明。" };
}

function GaltonBoard({ run, total }: { run: number; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = 620;
    const height = 620;
    canvas.width = width * 2;
    canvas.height = height * 2;
    context.scale(2, 2);

    const rows = 10;
    const top = 62;
    const rowGap = 31;
    const pegGap = 36;
    const binCount = rows + 1;
    const binWidth = 36;
    const boardCentre = width / 2;
    const dividerTop = 345;
    const floor = 578;
    const bins = Array(binCount).fill(0) as number[];
    const balls: Array<{ x: number; y: number; row: number; targetX: number; targetY: number; slot: number; settled: boolean }> = [];
    let spawned = 0;
    let frame = 0;
    let animation = 0;
    let finalFramePainted = false;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#2e7190";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "#16213c";
      context.lineWidth = 3;
      context.fillStyle = "#f5cf6b";
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col <= row; col += 1) {
          const x = boardCentre + (col - row / 2) * pegGap;
          const y = top + row * rowGap;
          context.beginPath();
          context.arc(x, y, 5, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        }
      }

      const binLeft = boardCentre - (binCount * binWidth) / 2;
      context.strokeStyle = "#16213c";
      context.lineWidth = 3;
      for (let index = 0; index <= binCount; index += 1) {
        const x = binLeft + index * binWidth;
        context.beginPath();
        context.moveTo(x, dividerTop);
        context.lineTo(x, floor + 8);
        context.stroke();
      }
      context.beginPath();
      context.moveTo(binLeft, floor + 8);
      context.lineTo(binLeft + binCount * binWidth, floor + 8);
      context.stroke();

      const maxBarHeight = floor - dividerTop - 9;
      const fixedPeak = Math.max(1, total * 0.27);
      bins.forEach((count, index) => {
        const barHeight = Math.min(maxBarHeight, (count / fixedPeak) * maxBarHeight);
        context.fillStyle = "#df4a3e";
        context.beginPath();
        context.roundRect(binLeft + index * binWidth + 5, floor - barHeight, binWidth - 10, barHeight, 8);
        context.fill();
        context.stroke();
        context.fillStyle = "#f8edcf";
        context.font = "bold 12px monospace";
        context.textAlign = "center";
        context.fillText(String(count), binLeft + index * binWidth + binWidth / 2, floor + 25);
      });

      const complete = spawned === total && balls.every((ball) => ball.settled);
      if (complete && total > 1) {
        context.strokeStyle = "#f5cf6b";
        context.lineWidth = 5;
        context.beginPath();
        for (let step = 0; step <= 120; step += 1) {
          const z = -3.2 + (step / 120) * 6.4;
          const density = Math.exp(-0.5 * z * z);
          const x = binLeft + ((z + 3.2) / 6.4) * binCount * binWidth;
          const y = floor - density * maxBarHeight * 0.93;
          if (step === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.stroke();
      }

      balls.forEach((ball) => {
        if (ball.settled) return;
        const speed = total === 1 ? 0.085 : 0.28;
        ball.x += (ball.targetX - ball.x) * speed;
        ball.y += (ball.targetY - ball.y) * speed;
        if (Math.abs(ball.y - ball.targetY) < 2.2) {
          if (ball.row < rows) {
            const right = Math.random() > 0.5;
            ball.slot += right ? 1 : 0;
            ball.row += 1;
            ball.targetX = boardCentre + (ball.slot - ball.row / 2) * pegGap;
            ball.targetY = top + ball.row * rowGap;
          } else {
            bins[ball.slot] += 1;
            ball.settled = true;
          }
        }
        if (ball.settled) return;
        context.fillStyle = "#df4a3e";
        context.beginPath();
        context.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      });

      frame += 1;
      const interval = total === 1 ? 1 : total === 250 ? 2 : 1;
      if (spawned < total && frame % interval === 0) {
        balls.push({ x: boardCentre, y: 20, row: 0, targetX: boardCentre, targetY: top, slot: 0, settled: false });
        spawned += 1;
      }
      const stillRunning = spawned < total || balls.some((ball) => !ball.settled);
      if (stillRunning) animation = requestAnimationFrame(draw);
      else if (!finalFramePainted) {
        finalFramePainted = true;
        animation = requestAnimationFrame(draw);
      }
    };
    draw();
    return () => cancelAnimationFrame(animation);
  }, [run, total]);

  return <canvas ref={canvasRef} className={styles.galtonCanvas} />;
}

export function MajorMatch() {
  const [language, setLanguage] = useState<Language>(() => new URLSearchParams(window.location.search).get("lang") === "zh" ? "zh" : "en");
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [galtonRun, setGaltonRun] = useState(0);
  const [galtonBalls, setGaltonBalls] = useState(250);

  const sCount = answers.filter((answer) => answer === "S").length;
  const dCount = answers.length - sCount;
  const pull = answers.length ? ((dCount - sCount) / ROUNDS.length) * 44 : 0;
  const zh = language === "zh";
  const tx = (copy: string) => zh ? ZH[copy] ?? copy : copy;
  const result = useMemo(() => language === "zh" ? resultForZh(sCount) : resultFor(sCount), [sCount, language]);
  const activeRound = language === "zh" ? ROUNDS_ZH[round] : ROUNDS[round];

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const switchLanguage = () => {
    const next: Language = zh ? "en" : "zh";
    const url = new URL(window.location.href);
    if (next === "zh") url.searchParams.set("lang", "zh"); else url.searchParams.delete("lang");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setLanguage(next);
  };

  const begin = () => {
    setStarted(true);
    window.setTimeout(() => document.getElementById("route")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const choose = (choice: Choice) => {
    const next = [...answers];
    next[round] = choice;
    setAnswers(next);
    window.setTimeout(() => {
      if (round === ROUNDS.length - 1) setShowResult(true);
      else setRound((value) => value + 1);
    }, 260);
  };

  const restart = () => {
    setAnswers([]);
    setRound(0);
    setShowResult(false);
    setStarted(true);
    document.getElementById("route")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className={styles.page} data-language={language}>
      <nav className={styles.nav} aria-label={zh ? "为什么选择统计学导航" : "Why Statistics navigation"}>
        <a href="#cover" className={styles.brand}>WHY STATISTICS</a>
        <div className={styles.navLinks}><a href="#news">{tx("News")}</a><a href="#difference">{tx("The difference")}</a><a href="#stories">{tx("Three ideas")}</a><a href="#curriculum">{tx("Courses")}</a><a href="#pathways">{tx("Pathways")}</a><a href="#route">{tx("Find your route")}</a></div>
        <div className={styles.navActions}>
          <a className={styles.werewolfNavLink} href={asset("sds-werewolf/")}>{zh ? "SDS狼人杀" : "SDS Werewolf"} <span>↗</span></a>
          <button className={styles.languageToggle} type="button" onClick={switchLanguage} aria-label={zh ? "Switch to English" : "切换至中文"}>{zh ? "EN" : "中文"}</button>
        </div>
      </nav>

      <section className={styles.cover} id="cover">
        <div className={styles.coverInner}>
          <p className={styles.coverKicker}>{tx("School of Data Science · CUHK Shenzhen")}</p>
          <h1 className={styles.coverTitle}>{tx("Statistics major in the age of data science and AI")}</h1>
          <p className={styles.coverAuthor}>{tx("The Statistics major team, CUHK Shenzhen")}</p>
          <a className={styles.coverCta} href="#play">{tx("Begin")} <span>→</span></a>
        </div>
        <aside className={styles.newsDock} id="news" aria-label={tx("Latest Statistics major news")}>
          <div className={styles.newsFlag}><span>{tx("NEWS")}</span></div>
          <div className={styles.newsItems}>
            {NEWS.map((item, index) => (
              <article className={`${styles.newsContent} ${index === 1 ? styles.newsFeatured : styles.newsSecondary}`} key={`${item.dateTime}-${item.title}`}>
                {index === 1 && <span className={styles.newsPriority}>{tx("FEATURED TALK")}</span>}
                <div className={styles.newsMeta}>
                  <time dateTime={item.dateTime}>{tx(item.date)}</time>
                  <span>{item.time}</span>
                  <span>{tx(item.venue)}</span>
                </div>
                <h2>{tx(item.title)}</h2>
                <p>{tx(item.copy)}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className={styles.playHero} id="play">
        <div className={styles.playCopy}>
          <p className={styles.kicker}>{tx("STATISTICS IS A WAY OF SEEING")}</p>
          <h1>{tx("Random one by one.")}<br />{tx("Predictable together.")}</h1>
          <p>{tx("Each ball takes an uncertain route. Drop enough of them and a stable pattern appears. Statistics turns noisy")} <strong className={styles.dataWord}>{tx("DATA")}</strong> {tx("into patterns we can understand — and decisions we can defend.")}</p>
          <div className={styles.galtonControls}>
            <button onClick={() => { setGaltonBalls(1); setGaltonRun((value) => value + 1); }}>{tx("DROP 1")}</button>
            <button onClick={() => { setGaltonBalls(250); setGaltonRun((value) => value + 1); }}>{tx("DROP 250")}</button>
            <button onClick={() => { setGaltonBalls(500); setGaltonRun((value) => value + 1); }}>{tx("DROP 500")}</button>
            <a href="#difference">{tx("SEE WHAT STATISTICS DOES ↓")}</a>
          </div>
        </div>
        <div className={styles.galtonWrap} aria-label="Animated Galton board forming a bell-shaped distribution">
          <GaltonBoard run={galtonRun} total={galtonBalls} />
          <p>{zh ? `第 ${galtonRun + 1} 次 · ${galtonBalls === 1 ? "一条不确定路径" : `${galtonBalls} 条路径 · 经验曲线逐渐接近正态密度`}` : `Run #${galtonRun + 1} · ${galtonBalls === 1 ? "one uncertain path" : `${galtonBalls} paths · the empirical curve converges to the normal density`}`}</p>
        </div>
      </section>

      <section className={styles.difference} id="difference">
        <p className={styles.kicker}>{tx("TWO FIELDS, DIFFERENT CENTRES OF GRAVITY")}</p>
        <h2>{tx("Prediction is powerful. Trust is a separate problem.")}</h2>
        <p className={styles.sectionLead}>{tx("Data Science asks how to predict, automate, and scale. Statistics asks what the evidence supports, how uncertain we are, and whether an observed relationship is causal.")}</p>
        <div className={styles.splitStatement}>
          <div><span>{tx("STATISTICS")}</span><strong>{tx("Inference")}<br />{tx("Causality")}<br />{tx("Uncertainty")}</strong><p>{tx("Reliable conclusions from limited, noisy, or high-stakes evidence.")}</p></div>
          <div className={styles.cross}>×</div>
          <div><span>{tx("DATA SCIENCE")}</span><strong>{tx("Prediction")}<br />{tx("Automation")}<br />{tx("Products")}</strong><p>{tx("Useful systems built from large, complex, and continuously changing data.")}</p></div>
        </div>
      </section>

      <section className={styles.conceptStories} id="stories">
        <p className={styles.kicker}>{tx("THREE QUESTIONS STATISTICS TRAINS YOU TO ASK")}</p>
        <h2>{tx("What do inference, causality, and uncertainty actually do?")}</h2>
        <div className={styles.storyGrid}>
          <article className={styles.teaStory}>
            <div className={styles.storyHeading}><span>{tx("01 · INFERENCE")}</span><h3>{tx("The Lady Tasting Tea")}</h3></div>
            <p className={styles.storyLead}>{tx("Can someone really taste which ingredient entered the cup first — or could a perfect result happen by chance?")}</p>
            <div className={styles.teaExperiment}>
              <div className={styles.teaCase}>
                <div className={`${styles.cup} ${styles.milkFirst}`}><i /><b /></div>
                <strong>{tx("MILK FIRST")}</strong><small>{tx("Tea descends and mixes into milk")}</small>
              </div>
              <div className={styles.teaVs}>?</div>
              <div className={styles.teaCase}>
                <div className={`${styles.cup} ${styles.teaFirst}`}><i /><b /></div>
                <strong>{tx("TEA FIRST")}</strong><small>{tx("Milk descends and mixes into tea")}</small>
              </div>
            </div>
            <div className={styles.trialResult}><strong>{tx("8 / 8 CORRECT")}</strong><span>{tx("Skill—or a lucky streak?")}</span></div>
            <div className={styles.storyAnswer}><b>{tx("Inference asks:")}</b> {tx("What is the chance she calls the next cup correctly? And how surprising is 8/8 if she were only guessing?")}</div>
            <p className={styles.storyFootnote}>{tx("Inspired by R. A. Fisher’s classic eight-cup experiment: the design matters as much as the result.")}</p>
          </article>

          <article className={styles.rainStory}>
            <div className={styles.storyHeading}><span>{tx("02 · CAUSALITY")}</span><h3>{tx("The Umbrella Mystery")}</h3></div>
            <p className={styles.storyLead}>{tx("On days with more umbrellas, traffic accidents also rise. Did umbrellas cause the accidents?")}</p>
            <div className={styles.causalVisuals}>
              <svg className={styles.causalChart} viewBox="0 0 320 205" role="img" aria-label="Umbrellas and accidents have a positive association">
                <line x1="67" y1="18" x2="67" y2="155"/><line x1="67" y1="155" x2="301" y2="155"/>
                <line className={styles.fitLine} x1="77" y1="137" x2="289" y2="39"/>
                {[[81,132],[99,111],[119,115],[139,94],[160,89],[181,77],[202,68],[225,59],[249,43],[279,38]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="7"/>)}
                <text x="184" y="187">{zh ? "更多雨伞 →" : "MORE UMBRELLAS →"}</text><text transform="translate(25 87) rotate(-90)">{zh ? "更多事故 →" : "MORE ACCIDENTS →"}</text>
              </svg>
              <svg className={styles.causalDag} viewBox="0 0 320 190" role="img" aria-label="Rain causes both more umbrellas and more accidents, while umbrellas do not cause accidents">
                <defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z"/></marker></defs>
                <circle cx="160" cy="38" r="31"/><text className={styles.dagIcon} x="160" y="51">🌧️</text>
                <line x1="137" y1="62" x2="86" y2="116" markerEnd="url(#arrowhead)"/><line x1="183" y1="62" x2="234" y2="116" markerEnd="url(#arrowhead)"/>
                <line className={styles.notCause} x1="111" y1="151" x2="209" y2="151"/>
                <path className={styles.causalCross} d="M151 139 L169 163 M169 139 L151 163"/>
                <circle cx="72" cy="149" r="34"/><text className={styles.dagIcon} x="72" y="163">☂️</text>
                <circle className={styles.dagOutcome} cx="248" cy="149" r="34"/><text className={styles.dagIcon} x="248" y="161">🚗💥</text>
              </svg>
            </div>
            <p className={styles.correlationNote}><b>{tx("Correlation is not causation.")}</b> {tx("Two things can rise together without one causing the other. Here, rain explains both.")}</p>
            <div className={styles.storyAnswer}><b>{tx("Causality asks:")}</b> {tx("What would happen to accidents if umbrellas themselves changed, while the rain did not?")}</div>
          </article>

          <article className={styles.uncertaintyStory}>
            <div className={styles.storyHeading}><span>{tx("03 · UNCERTAINTY")}</span><h3>{tx("Same 52%. Same confidence?")}</h3></div>
            <p className={styles.storyLead}>{tx("Imagine two baseball analysts estimating that a rookie has a 52% chance of reaching base next time. Their headline number is identical—but their evidence is not.")}</p>
            <p className={styles.hypotheticalTag}>{tx("A HYPOTHETICAL BASEBALL STORY")}</p>
            <div className={styles.pollCompare}>
              <div><span>{tx("FIRST 10 GAMES")}</span><strong>52%</strong><div className={styles.wideRange}><i /></div><small>{tx("A few unusual games can move the estimate a lot")}</small></div>
              <div><span>{tx("FULL 162-GAME SEASON")}</span><strong>52%</strong><div className={styles.narrowRange}><i /></div><small>{tx("More evidence makes the estimate more stable")}</small></div>
            </div>
            <div className={styles.storyAnswer}><b>{tx("Uncertainty asks:")}</b> {tx("Not only “What is our estimate?” but also “How much could it change if we observed more games?” Same estimate; very different confidence.")}</div>
          </article>
        </div>
      </section>

      <section className={styles.whyStat}>
        <div className={styles.sectionNumber}>{zh ? <>为什么选择<br />统计学</> : <>WHY<br />STATISTICS</>}</div>
        <div>
          <p className={styles.kicker}>{tx("DEPTH THAT REMAINS USEFUL")}</p>
          <h2>{tx("AI can produce an answer. Statistical training helps you know when it is wrong.")}</h2>
          <div className={styles.reasons}>
            <article><b>01</b><h3>{tx("Depth that lasts")}</h3><p>{tx("Probability, inference, modelling, uncertainty and causal reasoning remain valuable when tools and frameworks change.")}</p></article>
            <article><b>02</b><h3>{tx("Flexible destinations")}</h3><p>{tx("Statistics, Biostatistics, Data Science, Operations Research, Finance and evidence-intensive industry roles all remain open.")}</p></article>
            <article><b>03</b><h3>{tx("Proven outcomes across profiles")}</h3><p>{tx("Recent cohorts show viable graduate-study and industry pathways across a wide range of academic profiles.")}</p></article>
            <article><b>04</b><h3>{tx("A natural bridge to DS and AI")}</h3><p>{tx("A rigorous Statistics foundation makes later machine-learning and data-science skills easier to learn well.")}</p></article>
          </div>
        </div>
      </section>

      <section className={styles.curriculum} id="curriculum">
        <div className={styles.curriculumIntro}>
          <p className={styles.kicker}>{tx("WHY THESE COURSES?")}</p>
          <h2>{tx("The curriculum is built around one task: learning from evidence.")}</h2>
          <p className={styles.sectionLead}>{tx("Statistics turns data into defensible conclusions. That requires a common core for inference, then specialised methods for the structures that different fields produce.")}</p>
        </div>

        <div className={styles.applicationHistory}>
          <div className={styles.historyHeading}>
            <p className={styles.kicker}>{tx("APPLICATIONS CHANGED. THE QUESTION STAYED.")}</p>
            <h3>{tx("New data structures created new branches of Statistics.")}</h3>
            <p>{tx("Electives are not a random menu. Each one adapts inference to a recurring kind of evidence.")}</p>
          </div>
          <div className={styles.coreRibbon} aria-label={zh ? "统计学共同核心课程链" : "The Statistics common core"}>
            <div className={styles.coreRibbonLabel}><span>{tx("COMMON CORE · THE INFERENCE ENGINE")}</span><p>{tx("One shared goal: estimate what matters, quantify uncertainty, test claims and predict what comes next.")}</p></div>
            <ol>
              <li><b>01</b><div><strong>{tx("Probability")}</strong><small>{tx("Mathematical foundations, randomness, sampling variation and stochastic systems")}</small><em>MAT1001/1011 · MAT2041 · MAT2050 · MAT3007 · STA2001H</em></div></li>
              <li><b>02</b><div><strong>{tx("Inference")}</strong><small>{tx("Estimation, uncertainty, testing and decisions")}</small><em>STA2002H · STA3020</em></div></li>
              <li><b>03</b><div><strong>{tx("Learning from data")}</strong><small>{tx("Computing, statistical learning and reproducible modelling")}</small><em>STA3005 · STA3042</em></div></li>
            </ol>
          </div>
          <div className={styles.historyLine}>
            <article><time>{tx("EARLY 20TH C.")}</time><strong>{tx("Fields & experiments")}</strong><p>{tx("Designed comparisons, sampling and rank-based methods for noisy measurements.")}</p><em>{tx("Experimental Design · Nonparametric Statistics · Survey Sampling")}</em></article>
            <article><time>{tx("MID 20TH C.")}</time><strong>{tx("Industry & reliability")}</strong><p>{tx("Time-to-event, quality and multivariate measurements demanded new models.")}</p><em>{tx("Survival Modelling · Multivariate Analysis")}</em></article>
            <article><time>{tx("LATE 20TH C.")}</time><strong>{tx("Markets over time")}</strong><p>{tx("Prices, risk and dependent sequences made time and stochastic dynamics central.")}</p><em>{tx("Time Series · Stochastic Processes · Financial Modelling")}</em></article>
            <article><time>{tx("2000s →")}</time><strong>{tx("Health & genomes")}</strong><p>{tx("Clinical outcomes, categories and high-dimensional biological data widened the toolkit.")}</p><em>{tx("Categorical Data · Statistical Genetics · Bioinformatics")}</em></article>
            <article><time>{tx("NOW")}</time><strong>{tx("AI & complex data")}</strong><p>{tx("Modern prediction still needs uncertainty, causality, computation and evaluation.")}</p><em>{tx("Bayesian Statistics · Causal Inference · Machine Learning")}</em></article>
          </div>
        </div>

        <div className={styles.streams}>
          <div className={styles.streamsIntro}>
            <span>{tx("2026–27 STUDY SCHEME")}</span>
            <h3>{tx("Build the common core. Then choose the evidence you want to understand.")}</h3>
            <p><b>{zh ? "71 学分" : "71 units"}</b> {tx("in the major programme: 23 School Package + 18 Required + 30 Elective. Every student takes three courses in one stream for depth; four courses qualify for declaring that stream.")}</p>
          </div>
          <div className={styles.streamList}>
            <article><b>01</b><div><h4>{tx("Mathematical Statistics")}</h4><p>{tx("Probability theory, stochastic processes, advanced inference and the mathematical foundations beneath them.")}</p></div></article>
            <article><b>02</b><div><h4>{tx("Statistical Methodology")}</h4><p>{tx("Linear and generalised models, experiments, Bayesian methods, survival, time series and causality.")}</p></div></article>
            <article><b>03</b><div><h4>{tx("Biostatistics & Bioinformatics")}</h4><p>{tx("Health outcomes, genomes, categorical and survival data, plus biomedical machine learning.")}</p></div></article>
            <article><b>04</b><div><h4>{tx("Financial Statistics")}</h4><p>{tx("Time-dependent markets, stochastic calculus, risk, derivatives and financial modelling.")}</p></div></article>
            <article><b>05</b><div><h4>{tx("Computing & Machine Learning")}</h4><p>{tx("Algorithms, data structures, machine learning, deep learning and a capstone project.")}</p></div></article>
          </div>
          <p className={styles.curriculumSource}>{tx("Course titles and requirements follow the Statistics Study Scheme applicable to students admitted in 2026–27 and thereafter, last updated 20 July 2026.")}</p>
        </div>
      </section>

      <section className={styles.evidence}>
        <p className={styles.kicker}>{tx("CUHK-SZ STATISTICS MAJOR · RECENT COHORT SIGNALS")}</p>
        <h2>{tx("Statistics has supported strong progression into advanced study.")}</h2>
        <p className={styles.sectionLead}>{tx("The pattern is more useful than a GPA lookup table: across three recent cohorts, most recorded students pursued further study, with a meaningful share reaching PhD pathways.")}</p>
        <div className={styles.evidenceGrid}>
          <article>
            <div className={styles.evidenceHeader}><span>{tx("Further study")}</span><small>{tx("share of students with records")}</small></div>
            <div className={styles.metricRow}><b>2024</b><i><em style={{ width: "78%" }} /></i><strong>32/41 · 78%</strong></div>
            <div className={styles.metricRow}><b>2025</b><i><em style={{ width: "81%" }} /></i><strong>26/32 · 81%</strong></div>
            <div className={styles.metricRow}><b>2026*</b><i><em style={{ width: "89%" }} /></i><strong>39/44 · 89%</strong></div>
          </article>
          <article>
            <div className={styles.evidenceHeader}><span>{tx("PhD destinations / offers")}</span><small>{tx("share with at least one PhD pathway")}</small></div>
            <div className={styles.metricRow}><b>2024</b><i><em style={{ width: "4.9%" }} /></i><strong>2/41 · 4.9%</strong></div>
            <div className={styles.metricRow}><b>2025</b><i><em style={{ width: "12.5%" }} /></i><strong>4/32 · 12.5%</strong></div>
            <div className={styles.metricRow}><b>2026*</b><i><em style={{ width: "11.4%" }} /></i><strong>5/44 · 11.4%</strong></div>
          </article>
        </div>
        <p className={styles.methodNote}>{tx("Cohort record counts: 41 (2024), 32 (2025), and 44 (2026). *2026 figures reflect offers received as of August 2026 and are still updating; they are not necessarily final destinations. Students holding both study and employment offers may appear in both pathway categories.")}</p>
      </section>

      <section className={styles.pathways} id="pathways">
        <p className={styles.kicker}>{tx("WHERE CAN STATISTICS TAKE YOU?")}</p>
        <h2>{tx("Specialised paths — without closing the door to data careers.")}</h2>
        <div className={styles.pathwayList}>
          <article><span>01</span><h3>{tx("Graduate study")}</h3><p>{tx("Statistics, Biostatistics, Data Science, Operations Research, Finance, Public Health and related programmes.")}</p></article>
          <article><span>02</span><h3>{tx("Evidence-intensive work")}</h3><p>{tx("Clinical trials, experimental design, risk, actuarial work, quantitative research and policy evaluation.")}</p></article>
          <article><span>03</span><h3>{tx("Modern data roles")}</h3><p>{tx("Inference-focused data science, experimentation, product analytics, research engineering and AI evaluation.")}</p></article>
        </div>

        <div className={styles.profileLadder}>
          <div className={styles.profileIntro}>
            <span>{tx("RECENT COHORTS · POOLED")}</span>
            <h3>{tx("Pathways across academic profiles")}</h3>
          </div>
          <div className={styles.profileRows}>
            <article><span>{zh ? "前约 17%" : "TOP ~17%"}</span><div><h4>{zh ? "博士与顶尖硕士路径" : "PhD and elite Master’s routes"}</h4><p><b>{zh ? "博士：" : "PhD:"}</b> Yale, Chicago, Duke, Johns Hopkins, UNC, Emory, Washington, Minnesota, SMU and CUHK(SZ).</p><p><b>{zh ? "硕士：" : "Master’s:"}</b> Berkeley, Cornell, Northwestern, Michigan, UCL, NUS, HKU and CUHK.</p></div></article>
            <article><span>{zh ? "随后约 24%" : "NEXT ~24%"}</span><div><h4>{zh ? "美国前 30、香港与新加坡" : "US Top 30, Hong Kong and Singapore"}</h4><p><b>{zh ? "博士：" : "PhD:"}</b> CUHK(SZ).</p><p><b>{zh ? "硕士：" : "Master’s:"}</b> Berkeley, Chicago, Columbia, Cornell, Michigan, UPenn, Duke, UCLA, UCSD, UBC, NUS, HKU, CUHK, CUHK(SZ), CEMFI and Amsterdam.</p></div></article>
            <article><span>{zh ? "中间约 21%" : "MIDDLE ~21%"}</span><div><h4>{zh ? "有竞争力的硕士与行业路径" : "Competitive Master’s and industry"}</h4><p><b>{zh ? "博士：" : "PhD:"}</b> CUHK(SZ).</p><p><b>{zh ? "硕士：" : "Master’s:"}</b> Berkeley, Brown, Columbia, Cornell, UCLA, Washington, CMU, JHU, NYU, USC, NUS, NTU, HKU, HKUST, CUHK and CUHK(SZ){zh ? "，另有数据工程及行业录取。" : ", alongside data-engineering and industry offers."}</p></div></article>
            <article><span>{zh ? "随后约 21%" : "NEXT ~21%"}</span><div><h4>{zh ? "稳健的发展路径依然开放" : "Solid pathways remain open"}</h4><p>Cornell, UCLA, Michigan, Emory, Georgetown, Washington, Edinburgh, ANU, Amsterdam, NTU, HKUST, CUHK, CUHK(SZ), PolyU and CityU{zh ? "，另有科技与专业服务行业录取。" : ", plus technology and professional-services offers."}</p></div></article>
          </div>
          <p className={styles.profileNote}>{zh ? "比例根据 112 条记录中公开展示的四个学业层次合并计算，仅用于描述群体层次，并非个人精确排名。去向综合录取与已记录结果，并不穷尽所有情况，且可能重叠；最低的原始分组未在此展示。" : "Approximate shares are derived from pooled sizes of the four published academic-profile bands among 112 records; they are descriptive layers, not exact individual ranks. Destinations combine offers and recorded outcomes, are not exhaustive, and may overlap. The lowest original band is intentionally not displayed."}</p>
        </div>

        <div className={styles.outcomes}>
          <div className={styles.outcomesIntro}>
            <span>{tx("THE BIG PICTURE")}</span>
            <h3>{tx("One foundation, many directions")}</h3>
            <p>{tx("Across the profile layers, Statistics students move into doctoral study, specialised Master’s programmes and modern data work.")}</p>
          </div>
          <div className={styles.outcomeRows}>
            <article><b>{tx("Doctoral")}</b><p>{zh ? "统计学、生物统计、量化研究及相关方法学领域。" : "Statistics, Biostatistics, quantitative research and related methodological fields."}</p></article>
            <article><b>{tx("Master’s")}</b><p>{zh ? "全球范围的统计、数据科学、运筹、金融、公共卫生及其他量化项目。" : "Statistics, DS, OR, Finance, Public Health and other quantitative programmes worldwide."}</p></article>
            <article><b>{tx("Industry")}</b><p>{zh ? "数据工程、咨询、科技产品、银行、专业服务与研究助理岗位。" : "Data engineering, consulting, technology products, banking, professional services and research assistantships."}</p></article>
          </div>
        </div>
        <p className={styles.outcomeNote}>{tx("Individual outcomes vary, and a major is a foundation — not an admissions or employment guarantee.")}</p>

        <aside className={styles.handbookCard} aria-labelledby="graduate-handbook-title">
          <div className={styles.handbookVisual} aria-hidden="true">
            <svg viewBox="0 0 360 230">
              <path className={styles.handbookShadow} d="M50 64 L178 79 L307 62 L314 191 L180 211 L44 190 Z" />
              <path className={styles.handbookPage} d="M51 48 L178 67 L178 196 L48 178 Z" />
              <path className={styles.handbookPage} d="M178 67 L307 47 L310 178 L178 196 Z" />
              <path className={styles.handbookFold} d="M178 67 L178 196" />
              <path className={styles.handbookRoute} d="M73 145 C98 95 139 153 174 115 C213 72 244 142 289 88" />
              <circle className={styles.handbookStop} cx="74" cy="145" r="7" /><circle className={styles.handbookStop} cx="176" cy="114" r="7" /><circle className={styles.handbookStop} cx="289" cy="88" r="7" />
              <g className={styles.handbookFox}>
                <path d="M104 56 L116 25 L137 50 L161 26 L171 60 Q165 93 136 94 Q108 91 104 56 Z" />
                <path d="M116 45 L120 34 L128 49 M151 49 L159 35 L162 52" />
                <circle cx="125" cy="61" r="4" /><circle cx="151" cy="61" r="4" />
                <path d="M132 73 Q138 79 145 73" />
              </g>
              <g className={styles.handbookSigns}>
                <rect x="53" y="157" width="79" height="25" rx="3" /><text x="92.5" y="173">{tx("GRAD SCHOOL")}</text>
                <rect x="139" y="91" width="78" height="25" rx="3" /><text x="178" y="107">{tx("INTERNSHIP")}</text>
                <rect x="245" y="57" width="67" height="25" rx="3" /><text x="278.5" y="73">{tx("CAREER")}</text>
              </g>
            </svg>
            <span>{tx("Applications are hard. Borrow a map from someone who has just finished the journey.")}</span>
          </div>
          <div className={styles.handbookCopy}>
            <p className={styles.kicker}>{tx("FOR FINAL-YEAR STUDENTS · BUILT BY THE CLASS OF 2026")}</p>
            <h3 id="graduate-handbook-title">{tx("The numbers tell you where. Their stories tell you how.")}</h3>
            <p><strong>{tx("Your next application does not have to start from zero.")}</strong> {tx("The CUHK-Shenzhen Graduate Handbook collects first-hand stories from recent graduates about postgraduate applications, internships, careers, exchange programmes and the decisions behind them.")}</p>
            <div className={styles.handbookActions}>
              <a href="https://cuhkszfysc.github.io/" target="_blank" rel="noreferrer">
                {tx("EXPLORE THE GRADUATE HANDBOOK")} <span>↗</span>
              </a>
              <a className={styles.handbookContribute} href="https://cuhkszfysc.github.io/docs/contribute" target="_blank" rel="noreferrer">
                {tx("Have a story to share? Contribute to the handbook")} <span>↗</span>
              </a>
            </div>
            <code>cuhkszfysc.github.io</code>
            <small>{tx("An independent, student-led project by CUHK-Shenzhen graduates.")}</small>
          </div>
        </aside>
      </section>

      <section className={styles.close}>
        <p className={styles.kicker}>{tx("MAKE THE CHOICE ACCURATELY")}</p>
        <h2>{tx("If proofs, causality and uncertainty make you curious, Statistics is not a fallback. It may be your route.")}</h2>
        <p>{tx("Compare the required courses. Try one derivation and one small coding project. Then ask which kind of difficulty still feels worth solving.")}</p>
      </section>

      <div id="route">
      {!started ? (
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>{tx("STATISTICS")} × {tx("DATA SCIENCE")}</p>
            <h1>{tx("Do you want to build the answer — or decide whether it deserves trust?")}</h1>
            <p className={styles.lead}>{tx("Eight choices. Two ways of thinking with data. No better major in the abstract — only a clearer match for the questions you want to spend years solving.")}</p>
            <button className={styles.primary} onClick={begin}>{tx("Find your route")} <span>→</span></button>
            <p className={styles.micro}>{tx("A reflection tool, not a psychological assessment.")}</p>
          </div>
          <div className={styles.heroVisual} aria-label="Statistics and Data Science pull on opposite ends of a rope">
            <div className={styles.sunburst} />
            <img src={asset("assets/major-match/tug-of-war-hero-v2.png")} alt="Statistics fox and Data Science beaver pulling opposite ends of one rope" className={styles.heroDuel} />
            <span className={styles.statFlag}>{tx("STATISTICS")}</span><span className={styles.dsFlag}>{tx("DATA SCIENCE")}</span>
          </div>
        </section>
      ) : !showResult ? (
        <section className={styles.quiz} id="top">
          <div className={styles.progressTop}>
            <button className={styles.textButton} onClick={() => { setStarted(false); setAnswers([]); setRound(0); }}>← {tx("Route introduction")}</button>
            <span>{String(round + 1).padStart(2, "0")} / {String(ROUNDS.length).padStart(2, "0")}</span>
          </div>
          <div className={styles.progressTrack}><i style={{ width: `${((round + 1) / ROUNDS.length) * 100}%` }} /></div>
          <p className={styles.kicker}>{activeRound.chapter}</p>
          <h2>{activeRound.question}</h2>
          <div className={styles.choices}>
            <button className={`${styles.choice} ${styles.statChoice}`} onClick={() => choose("S")}>
              <span className={styles.choiceCode}>S</span><strong>{activeRound.stat.title}</strong><small>{activeRound.stat.copy}</small>
            </button>
            <button className={`${styles.choice} ${styles.dsChoice}`} onClick={() => choose("D")}>
              <span className={styles.choiceCode}>D</span><strong>{activeRound.ds.title}</strong><small>{activeRound.ds.copy}</small>
            </button>
          </div>
          <p className={styles.insight}>{activeRound.insight}</p>
          <div className={styles.tug} aria-label={`Statistics ${sCount}, Data Science ${dCount}`}>
            <div className={styles.tugLabels}><span>{tx("STATISTICS")} · {sCount}</span><span>{tx("DATA SCIENCE")} · {dCount}</span></div>
            <div className={styles.tugField}>
              <div className={`${styles.tugCharacter} ${styles.tugCharacterStat}`}><img src={asset("assets/major-match/tug-of-war-pair-ropefree.png")} alt="" /></div>
              <div className={styles.rope}><span style={{ left: `${50 + pull}%` }}><i /></span></div>
              <div className={`${styles.tugCharacter} ${styles.tugCharacterDs}`}><img src={asset("assets/major-match/tug-of-war-pair-ropefree.png")} alt="" /></div>
            </div>
          </div>
          {round > 0 && <button className={styles.back} onClick={() => setRound((value) => value - 1)}>← {tx("Change previous answer")}</button>}
        </section>
      ) : (
        <section className={styles.result} id="top">
          <p className={styles.kicker}>{result.eyebrow}</p>
          <h1>{result.label}</h1>
          <p className={styles.resultLead}>{result.copy}</p>
          <div className={styles.resultScale}>
            <span className={styles.scaleStat}>S · {sCount}</span><div><i style={{ left: `${12.5 + (dCount / ROUNDS.length) * 75}%` }} /></div><span className={styles.scaleDs}>{dCount} · D</span>
          </div>
          <div className={styles.fit}><span>{tx("YOUR ROUTE NOTE")}</span><p>{result.fit}</p></div>
          <button className={styles.secondary} onClick={restart}>{tx("Take it again")}</button>
          <a className={styles.primaryLink} href="#difference">{tx("Review the field comparison ↑")}</a>
        </section>
      )}
      </div>
      <footer className={styles.footer}>
        <span>{tx("School of Data Science · Why Statistics")}</span>
        <span className={styles.footerJoke}>{tx("Statisticians build products too — this website was made by the Statistics major team.")}</span>
        <span className={styles.footerCredit}>
          <strong>{tx("Statistics major in the age of data science and AI")}</strong>
          <em>{tx("The Statistics major team, CUHK Shenzhen")}</em>
        </span>
      </footer>
    </main>
  );
}
