# -------- Build Stage --------
FROM maven:3.8-openjdk-17 AS builder

WORKDIR /app

# Copy project files
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

# Package the application
RUN mvn package -DskipTests

# -------- Run Stage --------
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy the jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Expose the port used by Spring Boot
EXPOSE 8080

# Use the PORT env var set by Cloud Run
ENV PORT 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
