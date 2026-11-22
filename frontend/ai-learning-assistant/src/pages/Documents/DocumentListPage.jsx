import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  FileText,
  FolderPlus,
  Layers3,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import subjectService from "../../services/subjectService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import DocumentCard from "../../components/documents/DocumentCard";

const getId = (value) => String(value?._id ?? value ?? "");
const getErrorMessage = (error, fallback) => error?.message || error?.error || fallback;

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [topicName, setTopicName] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchLibrary = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [documentData, subjectData] = await Promise.all([
        documentService.getDocuments(),
        subjectService.getSubjects(),
      ]);
      setDocuments(documentData || []);
      setSubjects(subjectData || []);
      setSelectedSubjectId((current) => {
        if (current && subjectData.some((subject) => getId(subject) === current)) return current;
        return subjectData[0] ? getId(subjectData[0]) : "";
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't load your library."));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLibrary();
  }, [fetchLibrary]);

  const selectedSubject = subjects.find((subject) => getId(subject) === selectedSubjectId);
  const selectedTopic = selectedSubject?.topics?.find((topic) => getId(topic) === selectedTopicId);
  const topicDocuments = useMemo(
    () => documents.filter((doc) => getId(doc.subjectId) === selectedSubjectId && getId(doc.topicId) === selectedTopicId),
    [documents, selectedSubjectId, selectedTopicId]
  );
  const unorganizedDocuments = useMemo(
    () => documents.filter((doc) => !getId(doc.subjectId) || !getId(doc.topicId)),
    [documents]
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Choose a PDF file to continue.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDFs must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleCreateSubject = async (event) => {
    event.preventDefault();
    if (!subjectName.trim()) return;
    setCreatingSubject(true);
    try {
      const subject = await subjectService.createSubject(subjectName.trim());
      setSubjects((current) => [subject, ...current]);
      setSelectedSubjectId(getId(subject));
      setSelectedTopicId("");
      setSubjectName("");
      setIsSubjectModalOpen(false);
      toast.success("Subject created. Now add a topic.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't create the subject."));
    } finally {
      setCreatingSubject(false);
    }
  };

  const handleCreateTopic = async (event) => {
    event.preventDefault();
    if (!selectedSubject || !topicName.trim()) return;
    setCreatingTopic(true);
    try {
      const updatedSubject = await subjectService.createTopic(getId(selectedSubject), topicName.trim());
      const createdTopic = updatedSubject.topics?.[updatedSubject.topics.length - 1];
      setSubjects((current) => current.map((subject) => getId(subject) === getId(updatedSubject) ? updatedSubject : subject));
      setSelectedTopicId(getId(createdTopic));
      setTopicName("");
      setIsTopicModalOpen(false);
      toast.success("Topic created. You can upload its first PDF.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't create the topic."));
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedSubject || !selectedTopic || !uploadFile || !uploadTitle.trim()) {
      toast.error("Choose a PDF and give it a title.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle.trim());
    formData.append("subjectId", getId(selectedSubject));
    formData.append("topicId", getId(selectedTopic));

    try {
      await documentService.uploadDocument(formData);
      toast.success("PDF added to this topic.");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      await fetchLibrary(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "PDF upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      setDocuments((current) => current.filter((doc) => doc._id !== selectedDoc._id));
      toast.success("PDF deleted.");
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete this PDF."));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="library-loading"><Spinner /></div>;
  }

  return (
    <main className="library-page">
      <div className="library-shell">
        <header className="library-heading">
          <div>
            <p className="library-eyebrow"><Layers3 size={15} /> YOUR STUDY SPACE</p>
            <h1>Learning library</h1>
            <p className="library-subtitle">Keep every PDF in the right place: subject first, then topic.</p>
          </div>
          <Button onClick={() => setIsSubjectModalOpen(true)}>
            <Plus size={17} /> New subject
          </Button>
        </header>

        <section className="library-steps" aria-label="How to organize your PDFs">
          <div className={`library-step ${subjects.length ? "is-complete" : "is-active"}`}>
            <span className="library-step-number">{subjects.length ? <Check size={15} /> : "1"}</span>
            <span><strong>Create a subject</strong><small>For example, Biology</small></span>
          </div>
          <div className={`library-step ${selectedSubject?.topics?.length ? "is-complete" : subjects.length ? "is-active" : ""}`}>
            <span className="library-step-number">{selectedSubject?.topics?.length ? <Check size={15} /> : "2"}</span>
            <span><strong>Add a topic</strong><small>For example, Cell Structure</small></span>
          </div>
          <div className={`library-step ${selectedTopic ? "is-active" : ""}`}>
            <span className="library-step-number">3</span>
            <span><strong>Upload your PDF</strong><small>It stays inside that topic</small></span>
          </div>
        </section>

        <div className="library-layout">
          <aside className="library-panel library-subject-panel">
            <div className="library-panel-heading">
              <div><span className="library-panel-kicker">ORGANIZE</span><h2>Subjects</h2></div>
              <button className="library-icon-button" onClick={() => setIsSubjectModalOpen(true)} aria-label="Create subject" title="Create subject">
                <FolderPlus size={18} />
              </button>
            </div>

            {subjects.length ? (
              <div className="library-subject-list">
                {subjects.map((subject) => (
                  <button
                    key={getId(subject)}
                    className={`library-subject-button ${getId(subject) === selectedSubjectId ? "is-selected" : ""}`}
                    onClick={() => { setSelectedSubjectId(getId(subject)); setSelectedTopicId(""); }}
                  >
                    <span className="library-subject-icon"><BookOpen size={17} /></span>
                    <span className="library-subject-copy"><strong>{subject.name}</strong><small>{subject.topics?.length || 0} {subject.topics?.length === 1 ? "topic" : "topics"}</small></span>
                    <span className="library-subject-chevron">›</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="library-panel-empty">
                <div className="library-empty-icon"><BookOpen size={21} /></div>
                <strong>Start with a subject</strong>
                <p>Create a subject to give your study materials a home.</p>
                <button className="library-text-button" onClick={() => setIsSubjectModalOpen(true)}><Plus size={15} /> Create subject</button>
              </div>
            )}
          </aside>

          <section className="library-panel library-content-panel">
            {!selectedSubject ? (
              <div className="library-welcome">
                <div className="library-welcome-orbit"><Layers3 size={28} /></div>
                <span className="library-panel-kicker">YOUR LIBRARY, IN ORDER</span>
                <h2>Create your first subject</h2>
                <p>Make a subject, add a topic inside it, then upload the PDF you want to study.</p>
                <Button onClick={() => setIsSubjectModalOpen(true)}><Plus size={17} /> Create a subject</Button>
              </div>
            ) : (
              <>
                <div className="library-content-heading">
                  <div>
                    <span className="library-panel-kicker">SUBJECT</span>
                    <h2>{selectedSubject.name}</h2>
                    <p>{selectedSubject.topics?.length || 0} topics · {documents.filter((doc) => getId(doc.subjectId) === selectedSubjectId).length} PDFs</p>
                  </div>
                  <Button onClick={() => setIsTopicModalOpen(true)}><Plus size={17} /> Add topic</Button>
                </div>

                {selectedSubject.topics?.length ? (
                  <>
                    <div className="library-topic-list" aria-label="Topics">
                      {selectedSubject.topics.map((topic, index) => (
                        <button
                          key={getId(topic)}
                          className={`library-topic-button ${getId(topic) === selectedTopicId ? "is-selected" : ""}`}
                          onClick={() => setSelectedTopicId(getId(topic))}
                        >
                          <span className="library-topic-index">{String(index + 1).padStart(2, "0")}</span>
                          <span className="library-topic-copy"><strong>{topic.name}</strong><small>{documents.filter((doc) => getId(doc.subjectId) === selectedSubjectId && getId(doc.topicId) === getId(topic)).length} PDFs</small></span>
                          <span className="library-topic-arrow">↗</span>
                        </button>
                      ))}
                    </div>

                    {selectedTopic ? (
                      <div className="library-topic-documents">
                        <div className="library-topic-heading">
                          <div><span className="library-breadcrumb">{selectedSubject.name} <span>/</span> {selectedTopic.name}</span><h3>PDFs in this topic</h3></div>
                          <Button onClick={() => setIsUploadModalOpen(true)}><Upload size={16} /> Upload PDF</Button>
                        </div>
                        {topicDocuments.length ? (
                          <div className="library-doc-grid">
                            {topicDocuments.map((doc) => <DocumentCard key={doc._id} document={doc} onDelete={handleDeleteRequest} />)}
                          </div>
                        ) : (
                          <div className="library-empty-state">
                            <div className="library-empty-icon"><FileText size={23} /></div>
                            <strong>No PDFs in this topic yet</strong>
                            <p>Upload a PDF here and it will be saved under <b>{selectedSubject.name} / {selectedTopic.name}</b>.</p>
                            <Button onClick={() => setIsUploadModalOpen(true)}><Upload size={16} /> Upload first PDF</Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="library-prompt"><span className="library-prompt-step">NEXT</span><div><strong>Choose a topic</strong><p>Select a topic above to see its PDFs or upload a new one.</p></div></div>
                    )}
                  </>
                ) : (
                  <div className="library-empty-state library-no-topics">
                    <div className="library-empty-icon"><Layers3 size={23} /></div>
                    <strong>Add the first topic</strong>
                    <p>Topics keep this subject organized. Add one before uploading a PDF.</p>
                    <Button onClick={() => setIsTopicModalOpen(true)}><Plus size={16} /> Add a topic</Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {unorganizedDocuments.length > 0 && (
          <section className="library-legacy-section">
            <div><span className="library-panel-kicker">EXISTING MATERIALS</span><h2>Previously uploaded PDFs</h2><p>These files were added before subjects and topics were available.</p></div>
            <div className="library-doc-grid">
              {unorganizedDocuments.map((doc) => <DocumentCard key={doc._id} document={doc} onDelete={handleDeleteRequest} />)}
            </div>
          </section>
        )}
      </div>

      {isSubjectModalOpen && (
        <div className="library-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && !creatingSubject && setIsSubjectModalOpen(false)}>
          <form className="library-modal" onSubmit={handleCreateSubject} role="dialog" aria-modal="true" aria-labelledby="subject-modal-title">
            <button type="button" className="library-modal-close" onClick={() => setIsSubjectModalOpen(false)} disabled={creatingSubject} aria-label="Close"><X size={19} /></button>
            <span className="library-modal-icon"><BookOpen size={21} /></span>
            <span className="library-panel-kicker">STEP 1 OF 3</span>
            <h2 id="subject-modal-title">Create a subject</h2>
            <p>Choose a course or area of study. You can add topics next.</p>
            <label className="library-field-label" htmlFor="subject-name">Subject name</label>
            <input id="subject-name" className="library-field" value={subjectName} onChange={(event) => setSubjectName(event.target.value)} placeholder="e.g. Biology" maxLength={80} autoFocus required disabled={creatingSubject} />
            <div className="library-modal-actions"><button type="button" className="library-secondary-button" onClick={() => setIsSubjectModalOpen(false)} disabled={creatingSubject}>Cancel</button><button className="library-primary-button" type="submit" disabled={creatingSubject || !subjectName.trim()}>{creatingSubject ? "Creating…" : "Create subject"}</button></div>
          </form>
        </div>
      )}

      {isTopicModalOpen && selectedSubject && (
        <div className="library-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && !creatingTopic && setIsTopicModalOpen(false)}>
          <form className="library-modal" onSubmit={handleCreateTopic} role="dialog" aria-modal="true" aria-labelledby="topic-modal-title">
            <button type="button" className="library-modal-close" onClick={() => setIsTopicModalOpen(false)} disabled={creatingTopic} aria-label="Close"><X size={19} /></button>
            <span className="library-modal-icon"><Layers3 size={21} /></span>
            <span className="library-panel-kicker">STEP 2 OF 3 · {selectedSubject.name}</span>
            <h2 id="topic-modal-title">Add a topic</h2>
            <p>This topic will be created inside <b>{selectedSubject.name}</b>.</p>
            <label className="library-field-label" htmlFor="topic-name">Topic name</label>
            <input id="topic-name" className="library-field" value={topicName} onChange={(event) => setTopicName(event.target.value)} placeholder="e.g. Cell Structure" maxLength={80} autoFocus required disabled={creatingTopic} />
            <div className="library-modal-actions"><button type="button" className="library-secondary-button" onClick={() => setIsTopicModalOpen(false)} disabled={creatingTopic}>Cancel</button><button className="library-primary-button" type="submit" disabled={creatingTopic || !topicName.trim()}>{creatingTopic ? "Creating…" : "Create topic"}</button></div>
          </form>
        </div>
      )}

      {isUploadModalOpen && selectedSubject && selectedTopic && (
        <div className="library-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && !uploading && setIsUploadModalOpen(false)}>
          <form className="library-modal library-upload-modal" onSubmit={handleUpload} role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
            <button type="button" className="library-modal-close" onClick={() => setIsUploadModalOpen(false)} disabled={uploading} aria-label="Close"><X size={19} /></button>
            <span className="library-modal-icon"><Upload size={21} /></span>
            <span className="library-panel-kicker">STEP 3 OF 3</span>
            <h2 id="upload-modal-title">Upload a study PDF</h2>
            <div className="library-upload-location"><BookOpen size={15} /><span>{selectedSubject.name}</span><span>/</span><strong>{selectedTopic.name}</strong></div>
            <label className="library-field-label" htmlFor="document-title">Document title</label>
            <input id="document-title" className="library-field" value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} placeholder="e.g. Week 1 lecture notes" maxLength={120} required disabled={uploading} />
            <label className="library-file-picker" htmlFor="pdf-file">
              <input id="pdf-file" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} disabled={uploading} />
              <span className="library-file-icon"><Upload size={20} /></span>
              <strong>{uploadFile ? uploadFile.name : "Choose a PDF to upload"}</strong>
              <small>{uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change` : "PDF format · up to 10 MB"}</small>
            </label>
            <div className="library-modal-actions"><button type="button" className="library-secondary-button" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>Cancel</button><button className="library-primary-button" type="submit" disabled={uploading || !uploadFile || !uploadTitle.trim()}>{uploading ? "Uploading…" : "Upload PDF"}</button></div>
          </form>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="library-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && !deleting && setIsDeleteModalOpen(false)}>
          <div className="library-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <button type="button" className="library-modal-close" onClick={() => { setIsDeleteModalOpen(false); setSelectedDoc(null); }} disabled={deleting} aria-label="Close"><X size={19} /></button>
            <span className="library-modal-icon is-danger"><Trash2 size={21} /></span>
            <span className="library-panel-kicker">REMOVE PDF</span>
            <h2 id="delete-modal-title">Delete this document?</h2>
            <p><b>{selectedDoc?.title}</b> will be removed from your library. This action cannot be undone.</p>
            <div className="library-modal-actions"><button type="button" className="library-secondary-button" onClick={() => { setIsDeleteModalOpen(false); setSelectedDoc(null); }} disabled={deleting}>Keep PDF</button><button className="library-danger-button" type="button" onClick={handleConfirmDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete PDF"}</button></div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DocumentListPage;
