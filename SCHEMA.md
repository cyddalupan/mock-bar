# Database Schema

## Table: course

*   **id**: Primary Key
*   **title**: Course title
*   **short_description**: Brief description of the course
*   **description**: Detailed description of the course
*   **outcomes**: Learning outcomes
*   **faqs**: Frequently asked questions
*   **language**: Course language
*   **category_id**: Foreign Key to category table
*   **sub_category_id**: Foreign Key to sub_category table
*   **section**: Course sections/modules
*   **requirements**: Course prerequisites
*   **price**: Course price
*   **discount_flag**: Flag for discount (e.g., 0 for no discount, 1 for discount)
*   **discounted_price**: Price after discount
*   **level**: Difficulty level (e.g., beginner, intermediate, advanced)
*   **user_id**: Foreign Key to user table (creator of the course)
*   **thumbnail**: Path to course thumbnail image
*   **video_url**: URL of the course introduction video
*   **date_added**: Date course was added
*   **last_modified**: Date course was last modified
*   **course_type**: Type of course (e.g., paid, free)
*   **is_top_course**: Flag if it's a top course
*   **is_admin**: Flag if created by admin
*   **status**: Course status (e.g., draft, published)
*   **course_overview_provider**: Provider for course overview (e.g., YouTube, Vimeo)
*   **meta_keywords**: SEO meta keywords
*   **meta_description**: SEO meta description
*   **is_free_course**: Flag if the course is free
*   **multi_instructor**: Flag for multiple instructors
*   **enable_drip_content**: Flag to enable drip content
*   **creator**: Creator's name
*   **expiry_period**: Expiry period for the course
*   **upcoming_image_thumbnail**: Thumbnail for upcoming course
*   **publish_date**: Date of course publication

## Table: diag_ans

*   **id**: Primary Key
*   **user_id**: User ID associated with the answer
*   **batch_id**: Foreign Key to course table (representing course_id)
*   **question_id**: ID of the question
*   **answer**: User's answer
*   **score**: Score for the answer
*   **feedback**: Feedback for the answer
*   **date_created**: Date the answer was created

## Table: quiz_new

*   **q_id**: Primary Key
*   **q_course_id**: Foreign Key to course table
*   **q_subject_id**: Subject ID
*   **q_question**: Question text
*   **q_answer**: Correct answer
*   **q_level**: Difficulty level
*   **q_type**: "STANDARD" or "PRO"
*   **q_timer**: Timer in minutes (integer)
*   **q_created**: Timestamp of creation

## Table: diag_ans

*   **id**: Primary Key
*   **user_id**: User ID associated with the answer
*   **batch_id**: Foreign Key to course table (representing course_id)
*   **question_id**: ID of the question
*   **answer**: User's answer
*   **score**: Score for the answer
*   **feedback**: Feedback for the answer
*   **date_created**: Date the answer was created

## Table: diag_ans_retake

*   **id**: Primary Key
*   **user_id**: User ID associated with the retake
*   **batch_id**: Foreign Key to course table (representing course_id)
*   **question_id**: ID of the question being retaken
*   **answer**: User's retake answer
*   **score**: Score for the retake answer
*   **feedback**: Feedback for the retake answer
*   **date_created**: Date the retake answer was created