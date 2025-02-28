---
layout: home
permalink: index.html

# Please update this with your repository name and title
repository-name: e19-4yp-NLP-Driven-IBN-Layered-Architecture-for-SDNs
title: NLP driven Intent-Based Network Layered Architecture for Software Defined Networks
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template"

# NLP Driven Intent-Based Networking layered architecture for Software Defined Networks

#### Team

- e19409, Udugamasooriya D.P., [email](mailto:e19409@eng.pdn.ac.lk)
- e19413, Viduranga G.G.N, [email](mailto:e19413@eng.pdn.ac.lk)
- e19446, Wijerathna I.M.K.D.I. , [email](mailto:e19446@eng.pdn.ac.lk)

#### Supervisors

- Dr. Suneth Namal Karunarathna, [email](mailto:namal@eng.pdn.ac.lk)

#### Table of content

1. [Abstract](#abstract)
2. [Related works](#related-works)
3. [Methodology](#methodology)
4. [Experiment Setup and Implementation](#experiment-setup-and-implementation)
5. [Results and Analysis](#results-and-analysis)
6. [Conclusion](#conclusion)
7. [Publications](#publications)
8. [Links](#links)

---

<!-- 
DELETE THIS SAMPLE before publishing to GitHub Pages !!!
This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/)
![Sample Image](./images/sample.png) 
-->


## Abstract

## Related works

## Methodology

#### System Overview
The proposed system integrates AI-driven intent recognition with SDN (Software Defined Networking) to create an intelligent and adaptive networking framework. The architecture interprets natural language user intents, processes them through multiple intelligent layers, and dynamically enforces them using SDN controllers and programmable middleboxes.

![High-Level-Overview-of-the-System](images/system-overview.png)

#### High-Level Design
To provide a comprehensive understanding of the proposed Intent-Based Networking (IBN) Architecture, the following high-level design diagram illustrates the key components and their interactions:

![Proposed NLP-Driven IBN Layered Architecture](images/architecture-design.png)

This architecture consists of multiple layers, each responsible for processing and enforcing user-defined intents within an SDN-driven environment. The data flow begins with natural language input and ends with policy enforcement and feedback loops, ensuring adaptability and optimization.

#### Module Breakdown
The proposed IBN Architecture comprises the following key modules:

1. **User Intent Layer**  
   - Serves as the entry point for defining network policies in natural language.
   - Preprocesses user input and forwards it to NLP layers.

2. **Entity Extraction Layer**  
   - Extracts relevant entities from user inputs using AI-driven techniques.
   - Identifies configuration deployment requests or network queries.
   - Converts extracted information into structured data for further processing.

3. **Structured Intent Generation Layer**  
   - Uses Large Language Models (LLMs) to map extracted entities to predefined network policy templates.
   - Generates structured policies in formats such as YAML or JSON for validation before enforcement.

4. **Policy Optimization Layer**  
   - Employs Machine Learning (ML) and Reinforcement Learning (RL) to optimize policy parameters dynamically.
   - Utilizes real-time telemetry data for continuous network efficiency improvements.

5. **Intent Enforcement Layer**  
   - Translates optimized policies into SDN-compatible rules, including flow rules, routing configurations, QoS policies, and ACL rules.
   - Pushes structured policies to the SDN controller for enforcement.

6. **Control Layer**  
   - Houses the SDN controller for executing intent-driven policies.
   - Collects real-time performance metrics through the Southbound Interface (SBI).
   - Provides telemetry feedback to ML/NLP layers for improved decision-making.

7. **Middlebox Layer**  
   - Fine-tunes network configurations within programmable middleboxes.
   - Resolves conflicts before final enforcement and feeds telemetry data back to ML/RL modules for continuous refinement.

The architecture incorporates multiple feedback loops, enabling continuous refinement of network policies and ensuring alignment with real-time network conditions.
**To achieve this, we follow the Design Science Research (DSR) methodology, which supports a mixed-method approach (qualitative and quantitative) and facilitates iterative improvements through interactive refinement.**



## Experiment Setup and Implementation

### Emulation Setup and Topologies
To validate the proposed system, a network emulation environment is built using SDN-controlled topologies with automated traffic generation.

#### Key Technologies Used
- **NLP Model (DeepSeek, GPT, LLaMA):** For Natural Language Understanding (NLU). DeepSeek is preferred due to its reasoning capabilities and open-source flexibility.
- **Few-Shot Learning for Intent Extraction:** Enables complex user intent interpretation with minimal training data.
- **Reinforcement Learning (RL) for Policy Tuning:** Optimizes policy selection based on feedback from the emulated network environment.
- **Mininet/Containernet/P4 for Emulation:**
  - Mininet and Containernet provide scalable virtualized environments.
  - P4 enables Inband Network Telemetry (INT) monitoring for real-time visibility into network performance.
- **SDN Controllers (ONOS, OpenDaylight):**
  - ONOS is preferred due to its robust API support.
  - OpenDaylight is considered for performance comparisons.

#### High-Level Implementation Plan

![High-Level Implementation Plan](images/implementation-plan.png)

1. **User Intent Processing & Policy Generation**  
   - Users interact with a Chatbot UI and Monitoring Dashboard.
   - The NLP Server (DeepSeek/GPT/LLaMA) converts natural language prompts into structured network policies.
   - Policies are validated and stored in a backend server with a database.

2. **Intent Execution in Emulated SDN Topologies**  
   - The SDN Controllers (ONOS/OpenDaylight) enforce generated policies.
   - The system is tested on the following topologies:
     - **Collapsed Core:** Suitable for small networks with limited scalability.
     - **Spine-Leaf:** Used in large organizations for high availability and fault tolerance.
     - **Fat Tree:** Designed for high-performance computing environments and large scale complex networks.

3. **Real-Time Policy Adjustment Using ML & RL**  
   - A Machine Learning Engine predicts optimal QoS configurations based on telemetry feedback.
   - Reinforcement Learning dynamically refines policy parameters.

The implementation is designed to ensure scalability, adaptability, and efficiency in intent-based SDN environments.

## Results and Analysis

## Conclusion

## Publications
[//]: # "Note: Uncomment each once you uploaded the files to the repository"

<!-- 1. [Semester 7 report](./) -->
<!-- 2. [Semester 7 slides](./) -->
<!-- 3. [Semester 8 report](./) -->
<!-- 4. [Semester 8 slides](./) -->
<!-- 5. Author 1, Author 2 and Author 3 "Research paper title" (2021). [PDF](./). -->


## Links

[//]: # ( NOTE: EDIT THIS LINKS WITH YOUR REPO DETAILS )

- [Project Repository](https://github.com/cepdnaclk/repository-name)
- [Project Page](https://cepdnaclk.github.io/repository-name)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # "Please refer this to learn more about Markdown syntax"
[//]: # "https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet"
