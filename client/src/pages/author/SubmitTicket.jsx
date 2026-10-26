import React from 'react';
import { useSubmitTicket } from './useSubmitTicket';
import { SubmitTicketView } from './SubmitTicketView';

/**
 * SubmitTicket Page Container.
 * Binds functional form validation and ticket creation from useSubmitTicket to presentation in SubmitTicketView.
 */
export default function SubmitTicket() {
  const {
    books,
    loadingBooks,
    submitting,
    bookId,
    setBookId,
    subject,
    handleSubjectChange,
    description,
    handleDescriptionChange,
    fileName,
    handleFileChange,
    errors,
    handleSubmit,
    handleCancel,
  } = useSubmitTicket();

  return (
    <SubmitTicketView
      books={books}
      loadingBooks={loadingBooks}
      submitting={submitting}
      bookId={bookId}
      setBookId={setBookId}
      subject={subject}
      onSubjectChange={handleSubjectChange}
      description={description}
      onDescriptionChange={handleDescriptionChange}
      fileName={fileName}
      onFileChange={handleFileChange}
      errors={errors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
