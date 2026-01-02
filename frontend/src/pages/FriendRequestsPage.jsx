import React, { useEffect, useState } from 'react';
import { useFriendStore } from '../store/useFriendStore';
import { Check, X, UserPlus, Search, Loader } from 'lucide-react';

function FriendRequestsPage() {
    const { 
        receivedRequests, 
        sentRequests, 
        searchResults,
        isLoading, 
        isSearching,
        getFriendRequests, 
        acceptRequest, 
        rejectRequest,
        searchUsers,
        sendFriendRequest,
        clearSearchResults
    } = useFriendStore();

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getFriendRequests();
    }, [getFriendRequests]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers(searchQuery);
            } else {
                clearSearchResults();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, searchUsers, clearSearchResults]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen pt-20">
            <div className="max-w-4xl mx-auto p-4 py-8">
                <div className="bg-base-300 rounded-xl p-6 space-y-8">
                    
                    {/* Search Section */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Find Friends</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full input input-bordered pl-10"
                            />
                            {isSearching && (
                                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin size-5" />
                            )}
                        </div>

                        {/* Search Results */}
                        {searchQuery && (
                            <div className="mt-4 space-y-2">
                                {searchResults.length === 0 && !isSearching && (
                                    <p className="text-zinc-400 text-center py-4">No users found</p>
                                )}
                                {searchResults.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between bg-base-100 p-4 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.profilePic || "/avatar.png"}
                                                alt={user.fullName}
                                                className="size-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-medium">{user.fullName}</h3>
                                                <p className="text-sm text-zinc-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => sendFriendRequest(user._id)}
                                            className="btn btn-sm btn-primary gap-2"
                                        >
                                            <UserPlus className="size-4" />
                                            Add Friend
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Received Requests */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">
                            Friend Requests ({receivedRequests.length})
                        </h2>
                        {receivedRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <UserPlus className="size-12 mx-auto text-zinc-400 mb-2" />
                                <p className="text-zinc-400">No pending requests</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {receivedRequests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="flex items-center justify-between bg-base-100 p-4 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={request.profilePic || "/avatar.png"}
                                                alt={request.fullName}
                                                className="size-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-medium">{request.fullName}</h3>
                                                <p className="text-sm text-zinc-400">{request.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => acceptRequest(request._id)}
                                                className="btn btn-sm btn-success gap-1"
                                            >
                                                <Check className="size-4" />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(request._id)}
                                                className="btn btn-sm btn-error gap-1"
                                            >
                                                <X className="size-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sent Requests */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">
                            Sent Requests ({sentRequests.length})
                        </h2>
                        {sentRequests.length === 0 ? (
                            <p className="text-zinc-400">No pending sent requests</p>
                        ) : (
                            <div className="space-y-3">
                                {sentRequests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="flex items-center gap-3 bg-base-100 p-4 rounded-lg"
                                    >
                                        <img
                                            src={request.profilePic || "/avatar.png"}
                                            alt={request.fullName}
                                            className="size-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h3 className="font-medium">{request.fullName}</h3>
                                            <p className="text-sm text-zinc-400">Pending...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FriendRequestsPage;