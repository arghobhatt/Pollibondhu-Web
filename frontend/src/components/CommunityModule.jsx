import React, { useState, useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import EmptyState from './ui/EmptyState';
import ErrorAlert from './ui/ErrorAlert';

export default function CommunityModule({ currentUser, authToken, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('forum');
  
  const [forumPosts, setForumPosts] = useState([]);
  const [trainingCourses, setTrainingCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('কৃষি পরামর্শ');
  const [postContent, setPostContent] = useState('');
  const [postError, setPostError] = useState('');

  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchForumPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/forum/posts');
      if (res.ok) setForumPosts(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/training/courses');
      if (res.ok) setTrainingCourses(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'forum') fetchForumPosts();
    if (activeTab === 'training') fetchTrainingCourses();
  }, [activeTab]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      onOpenAuth();
      return;
    }
    setPostError('');

    try {
      const res = await fetch('/api/community/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: postTitle,
          category: postCategory,
          content: postContent
        })
      });
      if (res.ok) {
        setIsNewPostModalOpen(false);
        setPostTitle('');
        setPostContent('');
        fetchForumPosts();
      } else {
        const data = await res.json();
        setPostError(data.detail || 'ফোরাম পোস্ট তৈরি করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      setPostError('নেটওয়ার্ক ত্রুটি!');
    }
  };

  return (
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>💬 পল্লীবন্ধু কমিউনিটি ফোরাম ও ডিজিটাল ট্রেনিং হাব (Community & Training)</h2>
        <span className="pattern-tag">Citizen Engagement</span>
      </div>

      <div className="portal-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`nav-item ${activeTab === 'forum' ? 'active' : ''}`}
          onClick={() => setActiveTab('forum')}
        >
          💬 কৃষক ফোরাম ও আলোচনা
        </button>
        <button
          className={`nav-item ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          🎓 ডিজিটাল প্রশিক্ষণ হাব
        </button>
      </div>

      {activeTab === 'forum' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#38bdf8' }}>সাম্প্রতিক নাগরিক ফোরাম প্রশ্ন ও উত্তর</h3>
            <button
              className="btn"
              style={{ width: 'auto' }}
              onClick={() => {
                if (!authToken) onOpenAuth();
                else setIsNewPostModalOpen(true);
              }}
            >
              + নতুন প্রশ্ন/পরামর্শ লিখুন
            </button>
          </div>

          {loading ? (
            <LoadingSpinner message="ফোরাম পোস্টসমূহ লোড হচ্ছে..." />
          ) : forumPosts.length === 0 ? (
            <EmptyState
              icon="💬"
              title="কোন ফোরাম আলোচনা পাওয়া যায়নি"
              description="বর্তমানে ফোরামে নতুন কোন প্রশ্ন বা পোস্ট নেই। আপনি প্রথম প্রশ্ন শুরু করতে পারেন!"
              actionLabel="+ নতুন প্রশ্ন লিখুন"
              onAction={() => {
                if (!authToken) onOpenAuth();
                else setIsNewPostModalOpen(true);
              }}
            />
          ) : (
            <div className="grid-layout">
              {forumPosts.map((post) => (
                <div key={post.id} className="service-card col-6" style={{ marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span className="pattern-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>👀 {post.views_count} দেখা হয়েছে</span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: '0.5rem 0' }}>{post.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                      {post.content}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                    <span>👤 লেখক: {post.author_name}</span>
                    <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '1rem' }}>কৃষি ও পল্লী আধুনিকায়ন ভিডিও কোর্সসমূহ</h3>
          
          {loading ? (
            <LoadingSpinner message="ডিজিটাল ট্রেনিং কোর্সসমূহ লোড হচ্ছে..." />
          ) : trainingCourses.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="কোন প্রশিক্ষণ কোর্স পাওয়া যায়নি"
              description="বর্তমানে ডিরেক্টরিতে নতুন কোন ভিডিও প্রশিক্ষণ নথিভুক্ত নেই।"
            />
          ) : (
            <div className="grid-layout">
              {trainingCourses.map((course) => (
                <div key={course.id} className="service-card col-6" style={{ marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
                    <span className="pattern-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', marginBottom: '0.5rem' }}>
                      {course.category}
                    </span>

                    <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: '0.5rem 0' }}>{course.title_bn}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                      {course.description_bn}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '0.5rem' }}>
                      👨‍🏫 ট্রেইনার: {course.instructor_bn} | ⏱️ কোর্স সময়: {course.duration_hours} ঘণ্টা
                    </div>
                  </div>

                  <button
                    className="btn"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => setSelectedCourse(course)}
                  >
                    কোর্স বিস্তারিত ও ভিডিও দেখুন
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isNewPostModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>ফোরামে নতুন প্রশ্ন / পরামর্শ পোস্ট করুন</h3>
              <button className="close-btn" onClick={() => setIsNewPostModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handlePostSubmit}>
              <ErrorAlert message={postError} onDismiss={() => setPostError('')} />

              <div className="form-group">
                <label>বিষয় / শিরোনাম</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="আপনার প্রশ্ন বা আলোচনার বিষয় সংক্ষেপে লিখুন"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>ক্যাটাগরি</label>
                <select className="form-control" value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
                  <option value="কৃষি পরামর্শ">কৃষি পরামর্শ</option>
                  <option value="পশু পালন">পশু পালন</option>
                  <option value="মাছ চাষ">মাছ চাষ</option>
                  <option value="সাধারণ প্রশ্ন">সাধারণ প্রশ্ন</option>
                </select>
              </div>

              <div className="form-group">
                <label>বিস্তারিত বিবরণ</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="আপনার সমস্যা বা প্রশ্নের বিস্তারিত বিবরণ লিখুন..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn">ফোরামে প্রকাশ করুন</button>
            </form>
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>কোর্স বিস্তারিত: {selectedCourse.title_bn}</h3>
              <button className="close-btn" onClick={() => setSelectedCourse(null)}>✕</button>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              <p style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '0.5rem' }}>ক্যাটাগরি: {selectedCourse.category}</p>
              <p style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '1rem' }}>👨‍🏫 প্রশিক্ষক: {selectedCourse.instructor_bn}</p>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem' }}>{selectedCourse.description_bn}</p>

              {selectedCourse.video_url && (
                <a
                  href={selectedCourse.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ textDecoration: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  ▶️ টিউটোরিয়াল ভিডিও দেখুন ({selectedCourse.duration_hours} ঘণ্টা)
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
