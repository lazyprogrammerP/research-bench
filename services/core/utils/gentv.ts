import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
import OpenAIClient from "../lib/openai-client";

dotenv.config();

// Configurations
const ENCODER_SERVICE_URL = process.env.ENCODER_SERVICE_URL || "http://127.0.0.1:8000";

const gentv = {
  encode: async (file: Express.Multer.File) => {
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);

    const encoderResponse = await axios.post(`${ENCODER_SERVICE_URL}/api/v1/encode`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const base64Images: string[] = encoderResponse.data.images;

    return base64Images;
  },
  base64OCR: async (base64Images: string[]) => {
    const semLimit = 5;

    let result = ``;
    for (let i = 0; i < base64Images.length; i += semLimit) {
      const base64ImagesSlice = base64Images.slice(i, i + semLimit);

      const processes = await Promise.all(
        base64ImagesSlice.map(async (base64Image) => {
          return (
            await OpenAIClient.chat.completions.create({
              model: "gpt-4-vision-preview",
              messages: [
                {
                  role: "system",
                  content: `**Detailed Task for Extracting Information from an Image in a Research Paper**

**Objective:**
The task is to analyze an image from a research paper and extract various elements such as text, tables, equations, and other content types. The extracted information should then be organized into a Markdown document in the correct order as presented in the image.

**Instructions:**

1. **Image Analysis:**
   - Examine the given image carefully, noting the different types of content it contains. This includes:
     - Text: Look for paragraphs, sentences, and any textual information.
     - Tables: Identify structured data presented in tabular form.
     - Equations: Locate any mathematical expressions or equations within the image.
     - Figures: Note any graphical representations or charts.
     - Captions: Pay attention to any labels or captions associated with the content.

2. **Text Extraction:**
   - Transcribe all textual content from the image, including:
     - Headings: Extract section headings, subheadings, and titles.
     - Body Text: Capture paragraphs, sentences, and any descriptive text.
     - Citations: Include references and citations within the extracted text.
     NOTE: If you don't see a heading / sub-heading, the text might be a continuation from the previous page. In such a case, extract the text as is.

3. **Table Extraction:**
   - Identify tables within the image and extract them into Markdown format:
     - Each table should be separated clearly.
     - Capture table titles and headings.
     - Convert the table content into a Markdown table structure.

4. **Equation Extraction:**
   - Locate and extract any mathematical equations or expressions:
     - Use LaTeX formatting for mathematical notation.
     - Ensure the extracted equations are properly formatted in Markdown.

5. **Figure and Caption Handling:**
   - If the image contains figures or charts, include them in the Markdown document:
     - Describe the figure briefly in Markdown.
     - If there are captions, ensure they are included with the corresponding figures.

6. **Formatting Considerations:**
   - Maintain the correct order of content as it appears in the image:
     - Start with the title of the research paper (if visible in the image).
     - Follow with the extracted text, tables, equations, and figures in their respective order.
     - Use appropriate Markdown syntax for headings, lists, tables, and mathematical expressions.

7. **Quality Check:**
   - After extraction, review the Markdown document for accuracy and completeness:
     - Ensure all text is transcribed correctly.
     - Verify that tables and equations are accurately represented.
     - Confirm the correct placement of figures and their captions.

8. **Output Format:**
   - The final result should be a well-organized Markdown document:
     - Include headers for sections, sub-sections, and titles.
     - Markdown tables should be formatted neatly.
     - Equations should be in LaTeX format where applicable.
     - Figures should be accompanied by descriptions or captions.

**Additional Tips:**
   - Use image processing techniques to enhance text readability if necessary.
   - Pay attention to any symbols, notations, or special characters used in equations.
   - Maintain consistency in formatting throughout the Markdown document.

**Example Output (Markdown Template):**
# Research Paper Title

## Abstract
[Extracted abstract text goes here...]

## Introduction
[Extracted introduction text goes here...]

### Section 1
[Extracted text for section 1...]

#### Table 1: Title
| Column 1 Header | Column 2 Header |
|-----------------|-----------------|
| Data 1          | Data 2          |
| Data 3          | Data 4          |

#### Equation 1
$$
e^{i\pi} + 1 = 0
$$

### Section 2
[Extracted text for section 2...]

![Figure 1: Description of the figure.](figure1.png)
`,
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                    },
                  ],
                },
              ],
            })
          )?.choices?.[0]?.message?.content;
        })
      );

      processes.forEach((process) => {
        result += process;
      });
    }

    return result;
  },
  generateHighlights: async (content: string) => {
    return JSON.parse(
      (
        await OpenAIClient.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: `### Prompt:

You are tasked with summarizing the contents of a given research paper and providing a JSON output outlining the key highlights. The research paper covers the following areas:

1. **Research Objectives and Questions**: The primary aims and questions the research seeks to address.
2. **Methodology**: The approaches, techniques, or frameworks used to conduct the research.
3. **Main Findings**: The central discoveries, results, or outcomes of the research.
4. **Significance of Findings**: The importance, relevance, or impact of the discovered results.
5. **Limitations**: The constraints, weaknesses, or boundaries of the research that affect its conclusions.
6. **Future Directions**: Suggestions, possibilities, or areas for further research based on the findings.
7. **Conclusion**: The overall summary or wrap-up of the research paper.

### Approach:

Please follow these steps to create the JSON output:

1. **Read the Research Paper**: Before creating the summary, thoroughly read the research paper to grasp its content and nuances.
2. **Identify Key Sections**:
   - Look for the section that clearly states the research objectives and questions.
   - Find the part that details the methodology used in the research.
   - Locate where the main findings are presented.
   - Understand the discussion on the significance of these findings.
   - Note the limitations acknowledged by the researchers.
   - Pay attention to any suggestions or indications of future research directions.
   - Summarize the conclusion, which wraps up the entire research.
3. **Create JSON Output**:
   - For each of the identified sections above, create a JSON key-value pair.
   - The JSON structure should have keys for each section: "Research Objectives and Questions", "Methodology", "Main Findings", "Significance of Findings", "Limitations", "Future Directions", and "Conclusion".
   - The values of these keys should be the summarized content of the respective sections.
   - Ensure the JSON is well-structured and easy to understand.

### JSON Output Structure:
{
  "Research Objectives and Questions": "Summarized content about the aims and questions of the research.",
  "Methodology": "Summarized content about the approaches, techniques, or frameworks used in the research.",
  "Main Findings": "Summarized content about the central discoveries, results, or outcomes of the research.",
  "Significance of Findings": "Summarized content about the importance, relevance, or impact of the discovered results.",
  "Limitations": "Summarized content about the constraints, weaknesses, or boundaries of the research.",
  "Future Directions": "Summarized content about suggestions, possibilities, or areas for further research based on the findings.",
  "Conclusion": "Summarized content of the overall summary or wrap-up of the research paper."
}

### Instructions to the LLM:

1. **Read Carefully**: Read the provided research paper thoroughly to understand its contents.
2. **Summarize Key Sections**: Summarize each of the seven key sections mentioned above based on the content of the paper.
3. **Create JSON Output**:
   - For each section, create a JSON key-value pair as shown in the provided structure.
   - The keys should match the section titles exactly.
   - The values should be concise summaries of the corresponding sections, capturing the essence of the content.
4. **Maintain Clarity**: Ensure that the JSON output is clear, well-organized, and captures the main points of each section accurately.
5. **Use Formal Language**: Maintain a formal tone and language suitable for summarizing a research paper.
6. **Check for Completeness**: Ensure that your JSON output covers all the required sections: Research Objectives and Questions, Methodology, Main Findings, Significance of Findings, Limitations, Future Directions, and Conclusion.

Please provide the JSON output following the provided structure, ensuring a clear and concise summary of each section of the research paper.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Contents of the Research Paper:\n${content}`,
                },
              ],
            },
          ],
          max_tokens: 2048,
          response_format: { type: "json_object" },
        })
      ).choices[0].message.content || "{}"
    );
  },
};

export default gentv;
