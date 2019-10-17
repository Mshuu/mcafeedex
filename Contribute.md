# Contribution Guide

## Install git

Download and install git for your operating system: https://git-scm.com/downloads

## Create a GitHub account

Make a GitHub account: https://github.com/join

Follow the instructions as provided by GitHub

## Create a fork
Login to your GitHub account

Go to the main repo: https://github.com/Mshuu/mcafeedex

Click the "Fork" button at the top right of the page.

## Clone the fork
On your computer, choose a directory to store the repo.

Clone your fork, replacing [your-github-username] with your GitHub username:
git clone https://github.com/[your-github-username]/mcafeedex.git

cd mcafeedex

## Create a feature branch
It is best practice to create a separate branch for each issue or update that you are contributing. In general create a feature branch stemming from master.

git checkout master

Create a branch (replace 'feature-branch-name' with a short descriptive name of your feature, no spaces)

git checkout -b feature-branch-name

## Push feature branch to your fork on GitHub
git push -u origin feature-branch-name

## Add new files
If you added files as part of your changes

git add .

## Commit code updates
Edit code using the code editor of your choice, when you are ready, commit your changes

git commit -am "A descriptive commit message"

## Push code changes
Push the changes to your fork on Github

git push origin feature-branch-name

## Create a pull request
Now that you have pushed updates to your fork, you can create the pull request
Login and go to your repo fork page on Github, Click on the "Pull Requests" tab
https://github.com/[your-github-username]/mcafeedex/pulls

Click the "New pull request" green button

This will take you to a page, "Comparing changes" ...

Choose the base repository as "Mshuu/mcafeedex", master branch, in the left select options

Choose your fork, and the new branch you just created in the right set of select options

Click the "Create pull request" green button

Enter a short descriptive title for the pull request title. 

Enter a description, any relevant information necessary for the developers to understand what the pull request is for.

If you are working on an existing issue in the repo's issue queue, include a link to the issue.

Click the "Create pull request" button to create the pull request.

## Contribution guidelines

## How to update your fork from the main repo

