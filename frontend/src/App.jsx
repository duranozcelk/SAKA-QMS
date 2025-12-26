import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import FileViewer from './components/FileViewer'
import Toast from './components/Toast'
import ConfirmDialog from './components/ConfirmDialog'
import SearchModal from './components/SearchModal'

const API_BASE = '/api'

function App() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileContent, setFileContent] = useState(null)
    const [loading, setLoading] = useState(false)
    const [templates, setTemplates] = useState([])
    const [companies, setCompanies] = useState([])
    const [companyFiles, setCompanyFiles] = useState([])
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [toast, setToast] = useState(null)
    const [confirmDialog, setConfirmDialog] = useState(null)
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

    // Toast helper function
    const showToast = (message, type = 'info') => {
        setToast({ message, type })
    }

    // Arama fonksiyonu
    const handleSearch = async (query) => {
        // Boşsa aramayı yapma
        if (!query) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const params = new URLSearchParams()
            params.append('query', query)

            const response = await axios.get(`${API_BASE}/search?${params.toString()}`)
            setSearchResults(response.data.results || [])
        } catch (error) {
            console.error('Arama hatası:', error)
            if (error.response?.status !== 400) {
                showToast('Arama sırasında bir hata oluştu', 'error')
            }
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Aramayı temizle
    const clearSearch = () => {
        setSearchResults([])
    }

    // Şablonları yükle
    const loadTemplates = async () => {
        try {
            const response = await axios.get(`${API_BASE}/templates`)
            setTemplates(response.data.files || [])
        } catch (error) {
            console.error('Şablonlar yüklenirken hata:', error)
        }
    }

    // Firmaları yükle
    const loadCompanies = async () => {
        try {
            const response = await axios.get(`${API_BASE}/companies`)
            setCompanies(response.data.companies || [])
        } catch (error) {
            console.error('Firmalar yüklenirken hata:', error)
        }
    }

    // Firma dosyalarını yükle
    const loadCompanyFiles = async (companyName) => {
        if (!companyName) {
            setCompanyFiles([])
            return
        }

        try {
            const response = await axios.get(`${API_BASE}/companies/${companyName}/files`)
            setCompanyFiles(response.data.files || [])
        } catch (error) {
            console.error('Firma dosyaları yüklenirken hata:', error)
            setCompanyFiles([])
        }
    }

    // Firma seçildiğinde
    const handleCompanySelect = (companyName) => {
        setSelectedCompany(companyName)
        loadCompanyFiles(companyName)
    }

    // Firma silindiğinde
    const handleCompanyDelete = async (companyName) => {
        setConfirmDialog({
            title: 'Firmayı Sil',
            message: `"${companyName}" firmasını ve içindeki TÜM dosyaları silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.`,
            type: 'danger',
            onConfirm: async () => {
                setConfirmDialog(null)

                try {
                    await axios.delete(`${API_BASE}/companies/${companyName}`)

                    // Silinen firma seçili firma ise seçimi temizle
                    if (selectedCompany === companyName) {
                        setSelectedCompany(null)
                        setCompanyFiles([])
                    }

                    // Firma listesini güncelle
                    loadCompanies()

                    showToast('Firma başarıyla silindi!', 'success')
                } catch (error) {
                    console.error('Firma silme hatası:', error)
                    showToast('Firma silinirken bir hata oluştu: ' + (error.response?.data?.detail || error.message), 'error')
                }
            },
            onCancel: () => {
                setConfirmDialog(null)
            }
        })
    }

    // Sidebar toggle
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    // İlk yükleme
    useEffect(() => {
        loadTemplates()
        loadCompanies()

        // Global function for opening search modal from Sidebar
        window.openSearchModal = () => setIsSearchModalOpen(true)

        return () => {
            delete window.openSearchModal
        }
    }, [])

    // Dosya seçildiğinde içeriği yükle
    const handleFileSelect = async (file) => {
        setSelectedFile(file)
        setLoading(true)

        try {
            let response
            // Firma dosyası mı yoksa şablon dosyası mı kontrol et
            if (file.company) {
                // Firma dosyası
                response = await axios.get(`${API_BASE}/companies/${file.company}/file/${file.name}`)
            } else {
                // Şablon dosyası
                response = await axios.get(`${API_BASE}/file/${file.name}`)
            }
            setFileContent(response.data)
        } catch (error) {
            console.error('Dosya yüklenirken hata:', error)
            showToast('Dosya yüklenirken bir hata oluştu', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Dosya yüklendiğinde listeyi güncelle
    const handleFileUploaded = () => {
        loadTemplates()
    }

    // Dosya kaydedildiğinde
    const handleFileSaved = () => {
        loadCompanies()
        if (selectedCompany) {
            loadCompanyFiles(selectedCompany)
        }
        showToast('Dosya başarıyla kaydedildi!', 'success')
    }

    // Dosya silindiğinde
    const handleFileDelete = async (file) => {
        setConfirmDialog({
            title: 'Dosyayı Sil',
            message: `"${file.name}" dosyasını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.`,
            type: 'danger',
            onConfirm: async () => {
                setConfirmDialog(null)

                try {
                    // Firma dosyası mı yoksa şablon dosyası mı kontrol et
                    if (file.company) {
                        // Firma dosyası
                        await axios.delete(`${API_BASE}/companies/${file.company}/file/${file.name}`)
                    } else {
                        // Şablon dosyası
                        await axios.delete(`${API_BASE}/file/${file.name}`)
                    }

                    // Silinen dosya seçili dosya ise seçimi temizle
                    if (selectedFile?.name === file.name) {
                        setSelectedFile(null)
                        setFileContent(null)
                    }

                    // Listeleri güncelle
                    if (file.company) {
                        loadCompanyFiles(file.company)
                    } else {
                        loadTemplates()
                    }

                    showToast('Dosya başarıyla silindi!', 'success')
                } catch (error) {
                    console.error('Dosya silme hatası:', error)
                    showToast('Dosya silinirken bir hata oluştu: ' + (error.response?.data?.detail || error.message), 'error')
                }
            },
            onCancel: () => {
                setConfirmDialog(null)
            }
        })
    }

    return (
        <div className="flex h-screen bg-dark-900 overflow-hidden relative">
            {/* Hamburger Menu Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:border-dark-600 transition-all duration-200 active:scale-95 shadow-lg"
                aria-label="Toggle Sidebar"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span className={`block h-0.5 bg-primary-400 rounded-full transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block h-0.5 bg-primary-400 rounded-full transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block h-0.5 bg-primary-400 rounded-full transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
            </button>

            {/* Sidebar */}
            <Sidebar
                templates={templates}
                companies={companies}
                companyFiles={companyFiles}
                selectedCompany={selectedCompany}
                onCompanySelect={handleCompanySelect}
                onCompanyDelete={handleCompanyDelete}
                onFileSelect={handleFileSelect}
                onFileUploaded={handleFileUploaded}
                onFileDelete={handleFileDelete}
                onError={(msg) => showToast(msg, 'error')}
                selectedFile={selectedFile}
                isOpen={isSidebarOpen}
                onSearch={handleSearch}
                searchResults={searchResults}
                isSearching={isSearching}
                onClearSearch={clearSearch}
            />

            {/* Main Content Area */}
            <main className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'
                }`}>
                <FileViewer
                    fileContent={fileContent}
                    loading={loading}
                    companies={companies}
                    onFileSaved={handleFileSaved}
                    onCompanyAdded={loadCompanies}
                />
            </main>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Confirm Dialog */}
            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => {
                    setIsSearchModalOpen(false)
                    clearSearch()
                }}
                onSearch={handleSearch}
                searchResults={searchResults}
                isSearching={isSearching}
                onFileSelect={handleFileSelect}
            />
        </div>
    )
}

export default App
