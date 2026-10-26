import React from 'react';
import { useAdminTicketDetail } from './useAdminTicketDetail';
import { AdminTicketDetailView } from './AdminTicketDetailView';

/**
 * Operations Admin TicketDetail Page Container.
 * Binds functional ticket triage, AI draft generation, and response dispatching from useAdminTicketDetail to AdminTicketDetailView.
 */
export default function AdminTicketDetail() {
  const {
    ticket,
    loading,
    error,
    user,
    editStatus,
    setEditStatus,
    editCategory,
    setEditCategory,
    editPriority,
    setEditPriority,
    saving,
    responseContent,
    setResponseContent,
    sendingResponse,
    isAiDraft,
    generatingDraft,
    noteContent,
    setNoteContent,
    addingNote,
    handleSaveChanges,
    handleAssignToMe,
    handleGenerateAiDraft,
    handleSendResponse,
    handleAddNote,
  } = useAdminTicketDetail();

  return (
    <AdminTicketDetailView
      ticket={ticket}
      loading={loading}
      error={error}
      user={user}
      editStatus={editStatus}
      setEditStatus={setEditStatus}
      editCategory={editCategory}
      setEditCategory={setEditCategory}
      editPriority={editPriority}
      setEditPriority={setEditPriority}
      saving={saving}
      responseContent={responseContent}
      setResponseContent={setResponseContent}
      sendingResponse={sendingResponse}
      isAiDraft={isAiDraft}
      generatingDraft={generatingDraft}
      noteContent={noteContent}
      setNoteContent={setNoteContent}
      addingNote={addingNote}
      onSaveChanges={handleSaveChanges}
      onAssignToMe={handleAssignToMe}
      onGenerateAiDraft={handleGenerateAiDraft}
      onSendResponse={handleSendResponse}
      onAddNote={handleAddNote}
    />
  );
}
