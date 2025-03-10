# Service Order Assignment System

## Overview

This **Service Order Assignment System** was proposed as a project and served as an evaluative tool for the **Professional Practice (TI129)** course, aimed at passing the subject.

## Problem Statement

We were tasked with automating the work routine for mechanics in a **fictional company** using **APIs**. The system should help streamline the service order assignment process.

## Features

- **Login Screen**  
- **Mechanics Display**  
- **Vehicle Display**  
- **Main Screen**:  
  - Displays the users who created the service order.
  - Displays the assigned distribution center.
  - Shows the schedule date.
  - Includes buttons to:
    - Log out
    - Go to the Mechanics and Vehicles tabs
    - Refresh the page
    - Create the schedule for the selected center.

Before creating a user, the system requires the selection of a **valid date** and **distribution center**.

## Workflow

A **loading screen** was developed that simultaneously builds the schedule. After the loading is completed, the schedule is presented to the user, showing:

- The respective employees
- The vehicles
- The service orders for each vehicle that requires maintenance
- The start time for each service order

## Technologies Used

- **Backend**: JavaScript
- **Frontend**: HTML, CSS
- **APIs** (for communication between the backend and frontend)

## How It Works

- The **backend** was developed using **JavaScript** to handle the business logic, automation, and API requests.
- The **frontend** was built using **HTML** and **CSS** for the user interface, allowing users to interact with the system in an intuitive way.
