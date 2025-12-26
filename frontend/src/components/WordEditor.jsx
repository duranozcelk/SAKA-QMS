import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { renderAsync } from 'docx-preview'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

export default function WordEditor({ fileContent, companies, onFileSaved, onCompanyAdded }) {
    const [selectedCompany, setSelectedCompany] = useState('')
    const [newCompanyName, setNewCompanyName] = useState('')
    const [showNewCompanyModal, setShowNewCompanyModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const previewRef = useRef(null)

    useEffect(() => {
        loadDocument()
    }, [fileContent])

    const loadDocument = async () => {
        if (!fileContent || !fileContent.filename) {
            setError('Dosya bilgisi bulunamadı')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            // Binary dosyayı al
            const response = await axios.get(
                `${API_BASE_URL}/api/file/${fileContent.filename}/raw`,
                { responseType: 'blob' }
            )

            // docx-preview ile render et (READ-ONLY)
            if (previewRef.current) {
                previewRef.current.innerHTML = ''

                await renderAsync(response.data, previewRef.current, null, {
                    className: 'docx-preview-container',
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    ignoreLastRenderedPageBreak: false,
                    experimental: true,
                    trimXmlDeclaration: true,
                    debug: false
                })
            }

            setLoading(false)
        } catch (err) {
            console.error('Word dosyası yükleme hatası:', err)
            setError('Word dosyası yüklenirken bir hata oluştu: ' + (err.response?.data?.detail || err.message))
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!selectedCompany) {
            alert('Lütfen bir firma seçin')
            return
        }

        setSaving(true)
        try {
            // Sadece boş bir content gönder - backend template'i kopyalayacak
            await axios.post(API_ENDPOINTS.fileSave, {
                filename: fileContent.filename,
                company: selectedCompany,
                type: 'word',
                content: {
                    // Boş - sadece template kopyası istiyoruz
                }
            })

            onFileSaved()
        } catch (error) {
            console.error('Kaydetme hatası:', error)
            alert('Dosya kaydedilirken bir hata oluştu: ' + (error.response?.data?.detail || error.message))
        } finally {
            setSaving(false)
        }
    }

    const handleAddCompany = async () => {
        if (!newCompanyName.trim()) {
            alert('Lütfen firma adı girin')
            return
        }

        try {
            await axios.post(API_ENDPOINTS.companies, { name: newCompanyName })
            setShowNewCompanyModal(false)
            setNewCompanyName('')
            setSelectedCompany(newCompanyName)
            onCompanyAdded()
        } catch (error) {
            console.error('Firma ekleme hatası:', error)
            alert('Firma eklenirken bir hata oluştu: ' + (error.response?.data?.detail || error.message))
        }
    }

    return (
        <div className="h-full flex flex-col bg-dark-800">
            {/* Header */}
            <div className="bg-dark-800 border-b border-dark-700 shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-semibold text-dark-100">{fileContent.filename}</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-600 text-gray-200 rounded">Sadece Görüntüleme</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="px-3 py-1.5 bg-dark-700 border border-dark-600 text-dark-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Firma Seçin</option>
                            {companies.map(company => (
                                <option key={company.name} value={company.name}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowNewCompanyModal(true)}
                            className="px-3 py-1.5 text-sm bg-dark-700 border border-dark-600 text-dark-200 rounded hover:bg-dark-600"
                        >
                            + Yeni Firma
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !selectedCompany}
                            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Kaydediliyor...' : 'Firmaya Kaydet'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Word Preview (Read-only) */}
            <div className="flex-1 overflow-auto bg-dark-900 p-8">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-dark-300">Word belgesi yükleniyor...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md">
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={loadDocument}
                                className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="max-w-[21cm] mx-auto">
                        <div
                            ref={previewRef}
                            className="docx-wrapper bg-white shadow-lg"
                            style={{ minHeight: '29.7cm' }}
                        />
                    </div>
                )}
            </div>

            {/* New Company Modal */}
            {showNewCompanyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-dark-100 mb-4">Yeni Firma Ekle</h3>
                        <input
                            type="text"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            placeholder="Firma adını girin..."
                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 text-dark-100 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-dark-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCompany()}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddCompany}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                            >
                                Ekle
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewCompanyModal(false)
                                    setNewCompanyName('')
                                }}
                                className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 text-dark-200 rounded hover:bg-dark-600"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
