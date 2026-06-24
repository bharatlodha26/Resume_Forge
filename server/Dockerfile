FROM node:20-bullseye

# Install LaTeX and the required fonts/packages
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the server code
COPY . .

# Ensure data directories exist
RUN mkdir -p data/resumes latex

# Expose the port the API runs on
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]
