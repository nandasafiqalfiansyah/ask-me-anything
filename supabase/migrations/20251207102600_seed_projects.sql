-- Seed projects data from existing MDX files

-- Insert Moneo App
INSERT INTO projects (slug, title, summary, image_url, author, tags, published_at, content, sort_order)
VALUES (
  'moneo-app',
  'Moneo App',
  'Bangkit Academy with Google, Goto, and Traveloka Capstone Project.',
  '/images/projects/moneo-app.png',
  'ndav',
  ARRAY['Kotlin', 'Elysiajs', 'TensorFlow', 'Google Cloud'],
  '2024-11-25',
  '## Moneo App

**Moneo App** is a comprehensive money management application developed by
**Team CH2-PS188** as part of the **Bangkit Academy** program, led by **Google,
Tokopedia, Gojek, and Traveloka**. The application is designed to tackle the
critical issue of financial illiteracy in Indonesia. With a population of
**277.7 million people**, nearly half of the citizens struggle with managing
their personal finances, which negatively impacts economic growth and individual
well-being. Moneo seeks to bridge this gap by leveraging technology to provide a
**user-friendly mobile application** that assists users in managing their
finances effectively.

The **Moneo App** offers essential features such as **adding transactions,
generating financial reports, and providing AI-powered risk predictions** for
financial stability. With the integration of **machine learning models**, the
application can analyze financial patterns and predict potential financial
risks, helping users make informed decisions to achieve long-term financial
security.

### Key Features

Moneo App is designed with a range of functionalities aimed at improving
financial literacy and management. Some of its key features include:

- **Financial Pattern Detection**: The app utilizes **AI-powered analytics** to
  recognize spending patterns and provide insights into users'' financial
  behavior.
- **Real-Time Data Analysis**: By leveraging **Google Cloud**, the application
  processes financial data in real time, ensuring users receive accurate and
  up-to-date insights.
- **Secure and Efficient Backend**: The backend system, developed using
  **ElysiaJS**, is lightweight and optimized for performance, ensuring fast and
  reliable processing of financial data.
- **Predictive Risk Analysis**: **TensorFlow-based machine learning models**
  help forecast financial risks based on users'' transaction history and spending
  habits.

## Application Interface

The following image provides an overview of the Moneo App interface:

![Moneo App Screenshot](/images/projects/moneo-app.png)

## Technologies Used

The development of Moneo App integrates various cutting-edge technologies,
including:

- **Kotlin**: Used for building a seamless and intuitive Android mobile
  application.
- **ElysiaJS**: A lightweight and high-performance backend framework ensuring
  smooth application functionality.
- **TensorFlow**: Utilized for implementing machine learning models that analyze
  financial transactions and predict potential risks.
- **Google Cloud**: Provides cloud-based storage and processing solutions to
  ensure data security and efficiency.

## Installation and Usage

To install and run the Moneo App, follow these steps:

```bash
# Clone the repository
git clone https://github.com/CH2-PS188
cd moneo-app
# Install dependencies
npm install
# Start the backend
npm start
```

## Conclusion

Moneo App is an innovative financial management solution designed to address
Indonesia''s financial illiteracy challenge. By combining **artificial
intelligence, real-time analytics, and an intuitive user experience**, Moneo
empowers individuals to take control of their financial future. The integration
of **machine learning and cloud computing** ensures accurate predictions and
secure data handling, making it a reliable financial tool for everyday use.

For further inquiries, please visit my [GitHub](https://ndav.me/github).',
  0
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Anaksehat Web App
INSERT INTO projects (slug, title, summary, image_url, author, tags, published_at, content, sort_order)
VALUES (
  'anak-sehat',
  'Anaksehat Web App',
  'Runner-up of the Web Development Competition at ICONIC IT 2024.',
  '/images/projects/anak-sehat.png',
  'ndav',
  ARRAY['Next.js', 'Express.js', 'Flask', 'Heroku', 'Vercel', 'Python', 'AI'],
  '2024-11-25',
  '## Anaksehat Web App

**Anaksehat Web App** is an **AI-driven health platform** developed to address
the issue of **stunting** in children. The project was recognized as the
**Runner-up in the Web Development Competition at ICONIC IT 2024**, an event
organized by the **Informatics Student Association of the Faculty of
Engineering, Siliwangi University**. The competition, themed **"Supporting
Digital Transformation through Technological Innovation"**, aimed to encourage
critical thinking and innovation among students in the field of Information
Technology.

## Purpose and Impact

Stunting remains a major public health concern in Indonesia, affecting the
**growth and cognitive development** of millions of children. **Anaksehat Web
App** is designed to provide **early detection and analysis** of stunting risk
factors using **artificial intelligence**. By leveraging **machine learning
models**, the platform can analyze **nutritional intake, growth patterns, and
other relevant health data** to provide insights and recommendations for parents
and healthcare providers.

## Key Features

- **AI-Based Stunting Prediction**: Uses machine learning to assess and predict
  the risk of stunting in children based on health records and nutritional
  intake.
- **Real-Time Health Monitoring**: Tracks children''s growth progress and
  provides personalized health recommendations.
- **User-Friendly Dashboard**: Designed with an intuitive interface to ensure
  accessibility for parents and healthcare professionals.
- **Cloud-Powered Processing**: Utilizes **Heroku and Vercel** for hosting,
  ensuring seamless and scalable performance.

## Technologies Used

The development of **Anaksehat Web App** integrates various modern technologies,
including:

- **Next.js** – Frontend framework for building a responsive and efficient user
  interface.
- **Express.js & Flask** – Backend frameworks for API development and data
  processing.
- **Python & AI Models** – Used for implementing the **machine learning models**
  that analyze health data.
- **Heroku & Vercel** – Cloud hosting services ensuring the application is
  scalable and always available.

## Presentation & Live Website

To learn more about **Anaksehat Web App**, check out our official presentation
and live demo:

- **Presentation:**
  [View on Figma](<https://www.figma.com/proto/IqTrWs7LiiiF9dn2WyB19L/Portfolio-presentation-template-(Community)?node-id=1-183>)
- **Live Website:** [Visit Anaksehat Web App](https://anak-sehat.vercel.app/)

## Conclusion

**Anaksehat Web App** is a step forward in utilizing **artificial intelligence**
to combat **stunting in Indonesia**. By providing **early detection, real-time
monitoring, and personalized recommendations**, this platform empowers parents
and healthcare professionals to take proactive steps in ensuring children''s
health. This recognition at **ICONIC IT 2024** highlights the importance of
technology in addressing critical public health challenges.

For further inquiries, please visit my [GitHub](https://ndav.me/github).',
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Histotalk Web App
INSERT INTO projects (slug, title, summary, image_url, author, tags, published_at, content, sort_order)
VALUES (
  'histo-talk',
  'Histotalk Web App',
  'AI-Powered Interactive History Learning Platform with Smart NPCs',
  'https://github.com/DBS-Coding/Front-End/raw/master/public/cover.jpg',
  'ndav',
  ARRAY['Next.js', 'TensorFlow', 'Gemma 2B', 'Vercel', 'Python', 'AI', 'NLP'],
  '2024-12-15',
  '## Histotalk Web App

**Histotalk** is an interactive history education platform that provides
**direct conversation experience with historical figures** through AI-powered
NPCs (Non-Playable Characters). This innovative project revolutionizes history
learning by making it more immersive and engaging.

## Purpose and Benefits

History learning is often considered boring and passive. **Histotalk**
transforms this experience by:

- Enabling **direct conversations** with historical figures
- Using **AI to understand user questions** in context
- Delivering historical information through **natural conversations**
- Making history learning **more enjoyable and accessible**

## Key Features

- **Historical NPCs**: Interact with AI characters that emulate real historical
  figures'' speech patterns
- **Dual-Layer AI System**:
  - **Sentence Classification Model** (TensorFlow) for quick responses
  - **Generative Model** (Gemma 2B) for deeper conversations
- **Virtual Museum Interface**: Immersive design simulating a real museum
  walkthrough
- **Historical Context**: Every NPC response includes verified historical
  references

## Technology Stack

Histotalk is built with modern technologies:

- **Next.js** - Frontend framework for responsive interfaces
- **TensorFlow** - For sentence classification models
- **Gemma 2B** - Open-source language model as generative fallback
- **Python** - Natural language processing and AI logic
- **Vercel** - Application hosting and deployment

## Demo and Resources

Explore Histotalk further through:

- **Live Demo**: [Visit Histotalk](https://histotalk.vercel.app)
- **Source Code**: [GitHub Repository](https://github.com/histotalk-team)

## Conclusion

**Histotalk** revolutionizes history education by combining **cutting-edge AI
technology** with **interactive design**. The platform not only makes learning
more engaging but also helps users understand historical contexts through
natural conversations with important figures.

For more information, visit the
[official Histotalk website](https://histotalk.vercel.app).',
  2
)
ON CONFLICT (slug) DO NOTHING;
